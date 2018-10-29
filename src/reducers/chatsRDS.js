import * as chat from './../constants/chat'

const iniState = {
    tabs: [
        {
            id: 'global',
            name: 'global'
        }
    ],
    chatLists: {
        'global': []
    },
    active: 'global'

}

const chatsRDS = (state = iniState, action) => {
    switch (action.type) {
        case chat.SET_CHAT:
            return { ...state, tabs: [ ...state.tabs, action.payload.tab ], chatLists: { ...state.chatLists, ...action.payload.chat}  };
        case chat.UNSET_CHAT:
            //самый оптимальный путь удаления придуманный мной, хоть он и портит чистоту редьюсера,
            //зато с ним не возникнет проблем, так как он модифицирует текущее состояние
            let newChatList = { ...state.chatLists };
            delete newChatList[action.payload.id];
            return { ...state, tabs: [ ...action.payload.tabs ], chatLists: newChatList};
        case chat.ADD_MESSAGE:
            let newLists = { ...state.chatLists },
                messages = [ ...state.chatLists[action.payload.chatId]];
            newLists[action.payload.chatId] = [ action.payload.message, ...messages];
            return {...state, chatLists: newLists };
        case chat.SET_ACTIVE_CHAT:
            return { ...state, active: action.payload }
        default:
            return state

    }

}

export default chatsRDS;

