var express = require('express');
var http = require('http');
var sock = require('socket.io');

import reducer from './reducers'
import React from 'react';
import { renderToNodeStream } from 'react-dom/server'
import { AppContainer } from 'react-hot-loader'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import random from 'random-string-generator'

import App from './components/App'




var app = express();




var oneWeek = 86400000 * 7;
app.use('/static', express.static('dist/', { maxAge: oneWeek, lastModified: true }));

var webpack = require('webpack');
var config = require('./../webpack.config.dev');
var compiler = webpack(config);
app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

app.get('*', async function (req, res) {

    var urlCode = '';
    //определение передан ли код сессии в url
    if (req.originalUrl.split('/').length == 2 && req.originalUrl.split('/')[1].length == 8) {
        urlCode = req.originalUrl.split('/')[1];
    }

    let initialState = {
        constants: {
            server: {
                protocol: "http",
                adress: "localhost",
                port: "3080"
            },
            code: urlCode, //код в итоге пишется в редукс
            myId: '',
            nickname: ''
        }
    };


    const store = createStore(reducer, initialState, applyMiddleware(thunk));
    const StoreState = store.getState();

    const context = {};
    const stream = renderToNodeStream(
        <AppContainer>
            <Provider store={store}>
                <App />
            </Provider>
        </AppContainer>
    );

    res.write(`
    <!DOCTYPE html>
      <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" /> 
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
            <meta name="theme-color" content="#ffffff" />
            <title>Игра</title>
            <script type="application/javascript">
              window.__INITIAL_STATE__ = ${JSON.stringify(StoreState)};
            </script>
            <link rel="stylesheet" href="/static/styles.css">
        </head>
        <body><div id="root">
    `, () => {
        stream.pipe(res, { end: false });
        stream.on('end', () => {
            res.write(`
              </div>
                  
                  <script async type="application/javascript" src="/static/bundle.js"></script>
                </body>
              </html>
            `);
            res.end();
        });
    });




    return;
});


let server = http.createServer(app),
    io = sock(server),
    //объект для сессий игроков
    gamePlayerSessions = {},
    users = [],
    //конструктор для конкретной сессии
    sessionData = {
        players_count: 1,
        setted_gestures_count: 0
        // players: []
    },
    //конструктор игрока
    playerData = {
        score: 0,
        gesture: null
    },
    //матрица всех исходов игры, реализовано таким образом ради скорости доступа
    //1 - выиграл
    //0 - ничья
    //-1 - проиграл
    winMatrix = {
        spock: {
            spock: 0,
            rock: 1,
            paper: -1,
            scissors: 1,
            lizard: -1
        },
        rock: {
            spock: -1,
            rock: 0,
            paper: -1,
            scissors: 1,
            lizard: 1
        },
        paper: {
            spock: 1,
            rock: 1,
            paper: 0,
            scissors: -1,
            lizard: -1
        },
        scissors: {
            spock: -1,
            rock: -1,
            paper: 1,
            scissors: 0,
            lizard: 1
        },
        lizard: {
            spock: 1,
            rock: -1,
            paper: 1,
            scissors: -1,
            lizard: 0
        }
    },
    joinEvent = 'user_join_room',
    globalJoinEvent = 'user_join',
    fullLobbyEvent = 'game_is_full';


io.on('connect', client => {
    console.log('Client connected...');

    if (client.room !== undefined) {
        client.leave(client.room);
    }
    //навешиваем все необходимое на нового игрока
    client.on('join', data => {
        client.room = data.code;
        client.uid = data.id;
        users[client.uid] = client;
        client.broadcast.emit(globalJoinEvent, client.uid); // эвент для подключения к общему чату
        let playerIsAssignedToLobby = true;
        let wslink = 'gamelink_' + client.room;
        if (gamePlayerSessions[client.room] == undefined) { //создание игровой сессии
            gamePlayerSessions[client.room] = { ...sessionData, players: [] };
            gamePlayerSessions[client.room]['players'][client.uid] = { ...playerData };
            client.join(client.room);
        } else if (gamePlayerSessions[client.room]['players_count'] == 1) { // подключение игрока к существующей сессии
            gamePlayerSessions[client.room]['players_count']++;

            gamePlayerSessions[client.room]['players'][client.uid] = { ...playerData };
            client.join(client.room)
            client.broadcast.to(client.room).emit(joinEvent, client.uid); // эвент для подключения к чату комнаты
        } else { //обработка переполнения сессии, не позволяет подключаться на прослушку сокета
            client.emit(fullLobbyEvent);
            playerIsAssignedToLobby = false;
        }

        if (playerIsAssignedToLobby) {
            client.on(wslink, data => {

                if (data.text != undefined) { //пакет с заголовком
                    if (data.text == "gesture") { //пришел жест от клиента

                        gamePlayerSessions[client.room]['players'][data.payload.id]['gesture'] = data.payload.gesture;


                        if (data.payload.gesture != null) { // если жест обнулился

                            gamePlayerSessions[client.room]['setted_gestures_count']++;
                            client.broadcast.to(client.room).emit(wslink, { //отсылаем сведения клиентам, что оппонент сделал свой выбор
                                text: "gesture status",
                                payload: "ready"
                            });

                        } else {
                            gamePlayerSessions[client.room]['setted_gestures_count']--;
                        }

                        if (gamePlayerSessions[client.room]['players_count'] == gamePlayerSessions[client.room]['setted_gestures_count']) {//если выбрано столько же жестов сколько и игроков


                            let opponentId = '';
                            for (let id in gamePlayerSessions[client.room]['players']) {
                                if (id != data.payload.id) {
                                    opponentId = id;
                                    break;
                                }
                            }



                            //переприсваивание для более коротких имен и читабельности
                            let myGesture = gamePlayerSessions[client.room]['players'][data.payload.id]['gesture'],
                                opponentGesture = gamePlayerSessions[client.room]['players'][opponentId]['gesture'];

                            client.emit(wslink, { //отправляем результаты
                                text: 'round result',
                                payload: {
                                    gesture: opponentGesture,
                                    result: winMatrix[myGesture][opponentGesture]
                                }
                            });
                            client.broadcast.to(client.room).emit(wslink, { //отправляем результаты
                                text: 'round result',
                                payload: {
                                    gesture: myGesture,
                                    result: winMatrix[opponentGesture][myGesture]
                                }

                            });


                        }
                    }
                }
            })
        }

        client.on("webrtc", function(message) {
            console.log(message)
            if (message.to !== undefined && users[message.to] !== undefined) {
                // Если в сообщении указан получатель и этот получатель известен серверу, отправляем сообщение только ему...
                users[message.to].emit("webrtc", message);
            } else {
                // ...иначе считаем сообщение широковещательным
                client.broadcast.to(client.room).emit("webrtc", message);
            }
        });

        // Кто-то отсоединился
        client.on("disconnect", function() {
            // При отсоединении клиента, оповещаем об этом остальных
            client.broadcast.to(client.room).emit("leave", client.uid);
            delete users[client.uid];
            if (gamePlayerSessions[client.room]['players_count'] === 0) { //если игроков в сессии не осталось
                delete gamePlayerSessions[client.room];//удаляем игровую сессию
            }
        });
    })
})

server.listen(3080, function (err) {
    if (err) {
        return console.error(err);
    }

    console.log('dev server runned on port 3080');
});







