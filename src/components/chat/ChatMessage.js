import React,{ Component } from "react"

export default class ChatMessage extends Component {

    render() {

        let {
            owner,
            text
        } = this.props.data;

        return <span className="tab__message">
            <span className="tab__message-header">{owner}</span>
            :
            <span className="tab__message-text">{text}</span>
        </span>;
    }
}