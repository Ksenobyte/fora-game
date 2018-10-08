import React, { Component } from 'react'
import io from 'socket.io-client'
import { connect } from 'react-redux'
import random from 'random-string-generator'
import {bindActionCreators} from "redux";

import Screen from "./Screen"
import Lobby from "./Lobby"
import * as constActions from './../actions/constants'
import * as gameActions from './../actions/game'
import * as gameConsts from './../constants/game'
import GameArea from "./GameArea";



@connect(state => ({
    gameStage: state.game.stage,
    selectedGestures: state.game.chosenIcon,
    roundWinner: state.game.winner,
    server: state.constants.server,
    inviteCode: state.constants.code
}))
export default class App extends Component
{
    //управление обменом данными идет только в этом компоненте за счет прослушивания сокета
    //назначающегося в componentDidMount и отправки данных в componentDidUpdate
    socket = undefined;
    //id игрока
    myId = undefined;
    //основной ивент сокета для игры
    wslink = undefined;

    //объявление привязанных к хранилищу функций
    bindedGameActions = bindActionCreators(gameActions, this.props.dispatch);
    bindedConstActions = bindActionCreators(constActions, this.props.dispatch);

    //обработчик прослушки ивента сокета wslink
    gamelinkHandler = data => {

        if (data.text != undefined) {
            if (data.text == "player id") {
                this.myId = data.payload;
            } else if (data.text == "gesture") {
                this.bindedGameActions.setOpponentIcon(data.payload);
            } else if (data.text == "gesture status"){
                if (data.payload == 'ready') {
                    console.log(data);
                    this.bindedGameActions.setReadyStatus('opponent');
                }
            } else if (data.text == "round result") {

                this.bindedGameActions.setOpponentIcon(data.payload.gesture);

                switch (data.payload.result) {
                    case 1:
                        this.bindedGameActions.setWinnerMe();
                        break;
                    case 0:
                        this.bindedGameActions.setWinnerNone();
                        break;
                    case -1:
                        this.bindedGameActions.setWinnerOpponent();
                        break;
                    }
            }
        } else {
            if (data == 'player joined') {
                this.bindedGameActions.setGameStage();
            } else if (data == 'game already is full') {
                this.bindedGameActions.setInitStage();
            }
        }
    };
    componentDidMount(){
        let {
            server: {
                protocol,
                adress,
                port
            },
            inviteCode
        } = this.props;

        let code; //код текущей игровой сессии
        if (inviteCode.length > 0) {
            code = inviteCode; //либо берем из ссылки по которой перешли
            this.bindedGameActions.setGameStage();
        } else {
            code = random(8); //либо генерируем
        }
        this.wslink = 'gamelink_' + code;
        this.bindedConstActions.setInviteCode(code);

        let connectPath = `${protocol}://${adress}:${port}`; //адрес сокета берется из редукса

        this.socket = io.connect(connectPath);
        this.socket.on('connect', () => {
            this.socket.emit('join', code);//отсылаем на сервер код сессии для ее создания или подключения

        });

        this.socket.on(this.wslink, this.gamelinkHandler);
    }

    componentDidUpdate(prevProps){

        if (prevProps.selectedGestures.my != this.props.selectedGestures.my) { //если изменился жест у текущего игрока

            this.socket.emit('gamelink_' + this.props.inviteCode, {
                text: "gesture",
                payload: {
                    id: this.myId,
                    gesture: this.props.selectedGestures.my
                }
            });
        }
        if (prevProps.gameStage != gameConsts.INIT_STAGE && this.props.gameStage == gameConsts.INIT_STAGE) { //если изменилось состояние игры на инициализацию(попытка попасть в заполненную сессию)
            //отключаем старое соединение и настраиваем новое для новой игровой сессии
            this.socket.off('gamelink_' + this.props.inviteCode);
            let code = random(8);
            this.socket.on(this.wslink, this.gamelinkHandler);
            this.bindedConstActions.setInviteCode(code);
            window.history.pushState('','Игра','/'); //сбрасываем старый код из url
            this.socket.emit('join', code);
        }  else if (prevProps.roundWinner == null && this.props.roundWinner != null) {//был назначен победитель
            setTimeout(()=>{ //задержка в 1 секунду между сменой состояний для проигрывания анимаций
                this.bindedGameActions.unsetWinner();
            }, 1000)
        }
    }
    //функция для копирования по клику. Создает на долю секунды инпут в dom, из которого и копирует данные
    onClickClipboard(e) {
        let dataContainer = document.createElement("input");
        document.body.appendChild(dataContainer);
        dataContainer.value = e.target.innerHTML;
        dataContainer.select();
        document.execCommand("copy");
        document.body.removeChild(dataContainer);
    }








    render(){
        let {
            server,
            inviteCode,
            gameStage
        } = this.props;
        return (
            <Screen>
                {
                    gameStage == gameConsts.INIT_STAGE &&
                    <Lobby serverConsts={server} inviteCode={inviteCode} clickEventHandler={(e) => this.onClickClipboard(e)}/>
                }

                {
                    gameStage == gameConsts.GAME_STAGE &&
                    <GameArea />
                }

            </Screen>
        )
    }


}