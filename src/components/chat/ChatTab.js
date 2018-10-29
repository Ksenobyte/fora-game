import React,{ Component } from "react";
import ChatMessage from "./ChatMessage";
import { connect } from "react-redux";

@connect(state => ({
    chats: state.chats.chatLists
}))
export default class ChatTab extends Component {

    render() {

        let {
            item: {
                id
            },
            active
        } = this.props;

        let mappedMessages = this.props.chats[id].map((data, key)=> (
            <ChatMessage data={data} key={key}/>
        ))

        return <div className={`interface__chat-tabs_element tab-${id} ${active ? 'tab-active': ''}`} >
            {mappedMessages}
        </div>;
    }
}