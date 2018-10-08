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
            code: urlCode //код в итоге пишется в редукс
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
    //конструктор для конкретной сессии
    sessionData = {
        players_count: 1,
        setted_gestures_count: 0,
        players: []
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
}


io.on('connect', client => {
    console.log('Client connected...');

    var code = '';
    //навешиваем все неоходимое на нового игрока
    client.on('join', data => {
        code = data;
        var playerIsAssignedToLobby = true;
        var wslink = 'gamelink_' + code;
        if (gamePlayerSessions[code] == undefined) { //создание игровой сессии
            gamePlayerSessions[code] = { ...sessionData };
            gamePlayerSessions[code]['players'][1] = { ...playerData };
            client.emit(wslink, { //отсылаем присвоенный id серверу
                text: 'player id',
                payload: 1
            })
        } else if (gamePlayerSessions[code]['players_count'] == 1) { // подключение игрока к существующей сессии
            gamePlayerSessions[code]['players_count']++;

            let playerId = gamePlayerSessions[code]['players_count'];
            gamePlayerSessions[code]['players'][playerId] = { ...playerData };
            client.broadcast.emit(wslink, 'player joined');
            client.emit(wslink, {//отсылаем присвоенный id серверу
                text: 'player id',
                payload: playerId
            })
        } else { //обработка переполнения сессии, не позволяет подключаться на прослушку сокета
            client.emit(wslink, 'game already is full');
            playerIsAssignedToLobby = false;
        }

        if (playerIsAssignedToLobby) {
            client.on(wslink, data => {
                if (data.text != undefined) { //пакет с заголовком
                    if (data.text == "gesture") { //пришел жест от клиента
                        gamePlayerSessions[code]['players'][data.payload.id]['gesture'] = data.payload.gesture;

                        if (data.payload.gesture != null) { // если жест обнулился

                            gamePlayerSessions[code]['setted_gestures_count']++;
                            client.broadcast.emit(wslink, { //отсылаем сведения клиентам, что оппонент сделал свой выбор
                                text: "gesture status",
                                payload: "ready"
                            });

                        } else {
                            gamePlayerSessions[code]['setted_gestures_count']--;
                        }


                        if (gamePlayerSessions[code]['players_count'] == gamePlayerSessions[code]['setted_gestures_count']) {//если выбрано столько же жестов сколько и игроков

                            let opponentId = 1
                            if (data.payload.id == 1) {
                                opponentId = 2;
                            }
                            //переприсваивание для более коротких имен и читабельности
                            let myGesture = gamePlayerSessions[code]['players'][data.payload.id]['gesture'],
                                opponentGesture = gamePlayerSessions[code]['players'][opponentId]['gesture'];

                            client.emit(wslink, { //отправляем результаты
                                text: 'round result',
                                payload: {
                                    gesture: opponentGesture,
                                    result: winMatrix[myGesture][opponentGesture]
                                }
                            });
                            client.broadcast.emit(wslink, { //отправляем результаты
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
    })
})

server.listen(3080, function (err) {
    if (err) {
        return console.error(err);
    }

    console.log('dev server runned on port 3080');
});







