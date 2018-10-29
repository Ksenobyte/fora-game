import React, {Fragment, PureComponent} from "react";
import { connect } from 'react-redux'
import {bindActionCreators} from "redux";

import ChatTab from './ChatTab'
import ChatTabsHeaders from "./ChatTabsHeaders";
import ChatInput from "./ChatInput";
import { setActiveChat } from '../../actions/chat'
import { setNickname } from '../../actions/constants'

@connect(state => ({
    tabs: state.chats.tabs,
    activeTab: state.chats.active,
    nickname: state.constants.nickname
}))
export default class Chat extends PureComponent {

    setActiveChat = bindActionCreators(setActiveChat, this.props.dispatch);
    setNickname = bindActionCreators(setNickname, this.props.dispatch);

    onNicknameFormSubmit = (e) => {
        e.preventDefault()
        if (this.refs.nickname_input.value != '' && this.refs.nickname_input.value != undefined) {
            //не пустой никнейм
            this.setNickname(this.refs.nickname_input.value);
        }
    }

    render() {
        let {
            tabs,
            activeTab,
            chatInterface,
            nickname
        } = this.props;

        let mappedTabs = tabs.map(item=>(
            <ChatTab key={item.id} item={item} active={activeTab == item.id ? true : false}/>
        ));
        //если никнейм не установлен, показываем приглашение к вводу, иначе - сам чат
        return <div className="interface__chat">
            {
                nickname != '' &&
                <Fragment>
                    <ChatTabsHeaders tabs={tabs} active={activeTab} setActive={this.setActiveChat} />
                    <div className="interface__chat-tabs">
                        {mappedTabs}
                    </div>
                    <ChatInput chatInterface={chatInterface}/>
                </Fragment>
            }

            {   //не хотелось лишний раз прокидывать диспатч в маленькую заглушку специфичную для этого блока
                //и используемую 1 раз, потому оставил код здесь, надеюсь это не критично
                nickname == '' &&
                <Fragment>
                    <div className="interface__chat-preview-heading">Chat</div>
                    <div className="interface__chat-preview-text">Enter nickname to continue</div>
                    <div className="interface__chat-preview-input">
                        <form onSubmit={(e)=>this.onNicknameFormSubmit(e)}>
                            <input type="text" ref="nickname_input"/>
                            <button>Join</button>
                        </form>
                    </div>
                </Fragment>
            }


        </div>;
    }
}