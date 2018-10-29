import React,{ Component } from "react"
import { connect } from 'react-redux'
import {bindActionCreators} from "redux";

import { addMessage } from "../../actions/chat";

@connect(state => ({
    activeTab: state.chats.active,
    nickname: state.constants.nickname
}))
export default class ChatInput extends Component {

    addMessage = bindActionCreators(addMessage, this.props.dispatch);

    onSubmit = (e) => {
        e.preventDefault();

        let {
            chatInterface,
            activeTab,
            nickname
        } = this.props,
            input = this.refs.text_field;
        //отправляем сообщение пирам
        chatInterface.sendMessage(input.value, nickname, activeTab);
        //отображаем у себя
        this.addMessage(activeTab, {
            owner: nickname,
            text: input.value
        });
        //чистим инпут
        input.value = '';
        //ставим заного фокус для удобного набора нескольких сообщений
        input.focus();

    }

    render() {
        return (
            <form onSubmit={(e) => this.onSubmit(e)}>
                <div className="interface__chat-input">
                        <input type="text" ref="text_field" defaultValue="" />
                        <button type="button" onClick={(e) => this.onSubmit(e)} >Send</button>
                </div>
            </form>
        );
    }
}