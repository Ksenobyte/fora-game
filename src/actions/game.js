import * as game from "../constants/game";

export function setInitStage() {
    return dispatch => {

        dispatch({
            type: game.SET_INIT_STAGE
        })
    }
}

export function setGameLoadingStage() {
    return dispatch => {

        dispatch({
            type: game.SET_GAME_LOADING_STAGE
        })
    }
}
export function setGameStage() {
    return dispatch => {

        dispatch({
            type: game.SET_GAME_STAGE
        })
    }
}


export function setMyIcon(icon) {
    return dispatch => {

        dispatch({
            type: game.SET_MY_ICON,
            payload: icon
        })
    }
}

export function setOpponentIcon(icon) {
    return dispatch => {

        dispatch({
            type: game.SET_OPPONENT_ICON,
            payload: icon
        })
    }
}

export function setWinnerMe() {
    return dispatch => {

        dispatch({
            type: game.SET_WINNER_ME
        })
    }
}

export function setWinnerNone() {
    return dispatch => {

        dispatch({
            type: game.SET_WINNER_NONE
        })
    }
}

export function setWinnerOpponent() {
    return dispatch => {

        dispatch({
            type: game.SET_WINNER_OPPONENT
        })
    }
}

export function unsetWinner() {
    return dispatch => {

        dispatch({
            type: game.UNSET_WINNER
        })
    }
}

export function setReadyStatus(player) {
    return dispatch => {

        let event = '';
        if (player == 'my') {
            event = game.SET_READY_ME
        } else {
            event = game.SET_READY_OPPONENT
        }

        dispatch({
            type: event
        })
    }
}
export function unsetReadyStatus(player) {
    return dispatch => {

        let event = '';
        if (player == 'my') {
            event = game.UNSET_READY_ME
        } else {
            event = game.UNSET_READY_OPPONENT
        }

        dispatch({
            type: event
        })
    }
}


