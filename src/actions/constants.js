import * as cnst from "../constants/constants";

export function setInviteCode(code) {
    return dispatch => {

        dispatch({
            type: cnst.SET_INVITE_CODE,
            payload: code
        })
    }
}

export function setMyId(id) {
    return dispatch => {

        dispatch({
            type: cnst.SET_MY_ID,
            payload: id
        })
    }
}

export function setNickname(nick) {
    return dispatch => {

        dispatch({
            type: cnst.SET_NICKNAME,
            payload: nick
        })
    }
}