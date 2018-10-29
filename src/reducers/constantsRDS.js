import * as constants from './../constants/constants'

const iniState = {
    server:{
        protocol: "http",
        adress: "localhost",
        port: "3080"
    },
    code: '',
    myId: '',
    nickname: ''
};

const constantsRDS = (state = iniState, action) => {
    switch (action.type) {
        case constants.SET_INVITE_CODE:
            return { ...state, code: action.payload };
        case constants.SET_MY_ID:
            return { ...state, myId: action.payload };
        case constants.SET_NICKNAME:
            return { ...state, nickname: action.payload };
        default:
            return state

    }

}

export default constantsRDS;

