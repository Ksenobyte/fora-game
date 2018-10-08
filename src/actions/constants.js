import * as cnst from "../constants/constants";

export function setInviteCode(code) {
    return dispatch => {

        dispatch({
            type: cnst.SET_INVITE_CODE,
            payload: code
        })
    }
}