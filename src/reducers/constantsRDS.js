import * as constants from './../constants/constants'

const iniState = {
    server:{
        protocol: "http",
        adress: "localhost",
        port: "3080"
    },
    code: ''
}

const constantsRDS = (state = iniState, action) => {
    switch (action.type) {
        case constants.SET_INVITE_CODE:
            return { ...state, code: action.payload}
        default:
            return state

    }

}

export default constantsRDS;

