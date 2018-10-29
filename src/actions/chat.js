
import * as chat from "../constants/chat";

export function addMessage(chatId, message) {
    return dispatch => {
        console.log(chatId, message);
        dispatch({
            type: chat.ADD_MESSAGE,
            payload: {
                chatId,
                message

            }
        })
    }
}

export function setActiveChat(chatId) {
    return dispatch => {

        dispatch({
            type: chat.SET_ACTIVE_CHAT,
            payload: chatId
        })
    }
}

export function addChat(tab, chatItem) {
    return dispatch => {

        dispatch({
            type: chat.SET_CHAT,
            payload: {
                tab,
                chat: chatItem
            }
        })
    }
}

export function removeChat(tabs, chatItemId) {
    return dispatch => {

        dispatch({
            type: chat.UNSET_CHAT,
            payload: {
                tabs,
                id: chatItemId
            }
        })
    }
}


