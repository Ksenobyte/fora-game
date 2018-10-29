import React, { Component } from 'react'
import io from 'socket.io-client'
import { connect } from 'react-redux'
import random from 'random-string-generator'
import {bindActionCreators} from "redux";

import Screen from "./Screen"
import Lobby from "./Lobby"
import * as constActions from './../actions/constants'
import * as gameActions from './../actions/game'
import * as chatActions from './../actions/chat'
import * as gameConsts from './../constants/game'
import GameArea from "./GameArea";
import webRTCInterface from "../resources/lib/webRTC";
import Chat from "./chat/Chat";



@connect(state => ({
    gameStage: state.game.stage,
    selectedGestures: state.game.chosenIcon,
    roundWinner: state.game.winner,
    server: state.constants.server,
    inviteCode: state.constants.code,
    nickname: state.constants.nickname
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

    chatInterface = undefined;

    pendingUsers = {
        'global': []
    };

    //объявление привязанных к хранилищу функций
    bindedGameActions = bindActionCreators(gameActions, this.props.dispatch);
    bindedConstActions = bindActionCreators(constActions, this.props.dispatch);
    bindedChatActions = bindActionCreators(chatActions, this.props.dispatch);

    //обработчик прослушки ивента сокета wslink
    gamelinkHandler = data => {

        if (data.text != undefined) {
            if (data.text == "gesture") {
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
        this.myId = `${random(2)}-${random(5)}-${random(7)}`;
        this.bindedConstActions.setMyId(this.myId);

        this.wslink = 'gamelink_' + code;
        this.bindedConstActions.setInviteCode(code);

        let connectPath = `${protocol}://${adress}:${port}`; //адрес сокета берется из редукса



        this.socket = io.connect(connectPath);
        this.chatInterface = new webRTCInterface(this.socket, this.myId, () => {}, this.bindedChatActions.addMessage, this.bindedChatActions.addChat);

        this.socket.on("webrtc", (data) => {
            this.chatInterface.socketReceived(data)
        });

        this.socket.on(this.wslink, this.gamelinkHandler);
        let joinEvent = 'user_join_room',
            globalJoinEvent = 'user_join',
            fullLobbyEvent = 'game_is_full';

        this.socket.on(globalJoinEvent, userId => {

            if (this.props.nickname != '') {

                this.chatInterface.socketNewPeer(userId);
            } else { //отсрочка установки соединения с удаленным браузером, пока один из пользователей
                this.pendingUsers['global'].push(userId);
            }

        })

        this.socket.on(joinEvent, userId => {
            let localChatId = 'local';

            this.bindedGameActions.setGameStage();
            if ( this.props.nickname != '' ) {
                this.chatInterface.createChannel(localChatId, userId);
            } else {
                if ( this.pendingUsers[localChatId] == undefined ) {
                    this.pendingUsers[localChatId] = [];
                }
                this.pendingUsers[localChatId].push(userId);
            }

        })

        this.socket.on(fullLobbyEvent, () => {
            this.bindedGameActions.setInitStage();
        })

        this.socket.on('connect', () => {
            this.socket.emit('join', {code, id: this.myId});//отсылаем на сервер код сессии для ее создания или подключения
        });
    }

    async componentDidUpdate(prevProps){

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
            this.socket.emit('join', {code, id: this.myId});
        }  else if (prevProps.roundWinner == null && this.props.roundWinner != null) {//был назначен победитель
            setTimeout(()=>{ //задержка в 1 секунду между сменой состояний для проигрывания анимаций
                this.bindedGameActions.unsetWinner();
            }, 1000)
        }
        if (prevProps.nickname != this.props.nickname && prevProps.nickname == '') {

            for(let user of this.pendingUsers['global']) {
                console.log(user)
                await this.chatInterface.socketNewPeer(user);
            }

            this.pendingUsers['global'] = [];

            for(let channelId in this.pendingUsers) {
                for(let user of this.pendingUsers[channelId]) {
                    console.log(user)
                    this.chatInterface.createChannel(channelId, user);
                }
                this.pendingUsers[channelId] = [];
            }
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

    componentWillUnmount(){
        this.chatInterface.closeChannels();
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
                {
                    this.chatInterface != undefined &&
                    <Chat chatInterface={this.chatInterface} />
                }

            </Screen>
        )
    }


}