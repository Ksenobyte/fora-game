import * as game from './../constants/game'

const iniState = {
    stage: game.INIT_STAGE,
    sound: {
        enabled: true,
        volume: 100
    },
    chosenIcon: {
        my: null,
        opponent: null
    },
    ready: {
        my: false,
        opponent: false
    },
    winner: null,
    score: {
        my: 0,
        opponent: 0
    }

};

const gameRDS = (state = iniState, action) => {
    switch (action.type) {
        case game.SET_INIT_STAGE:
            return { ...state, stage: game.INIT_STAGE }
        case game.SET_GAME_STAGE:
            return { ...state, stage: game.GAME_STAGE }
        case game.SET_MY_ICON:
            return { ...state, chosenIcon: { ...state.chosenIcon, my: action.payload}, ready: { ...state.ready, my: true}}
        case game.SET_OPPONENT_ICON:
            return { ...state, chosenIcon: { ...state.chosenIcon, opponent: action.payload}}
        case game.UNSET_WINNER:
            return { ...state, winner: null, chosenIcon:{my: null, opponent: null}, ready: {my: false, opponent: false}}
        case game.SET_WINNER_ME:
            return { ...state, winner: game.WINNER_ME, score: { ...state.score, my: ++state.score.my}}
        case game.SET_WINNER_NONE:
            return { ...state, winner: game.WINNER_NONE}
        case game.SET_WINNER_OPPONENT:
            return { ...state, winner: game.WINNER_OPPONENT, score: { ...state.score, opponent: ++state.score.opponent}}
        case game.SET_READY_ME:
            return { ...state, ready: { ...state.ready, my: true}};
        case game.UNSET_READY_ME:
            return { ...state, ready: { ...state.ready, my: false}};
        case game.SET_READY_OPPONENT:
            return { ...state, ready: { ...state.ready, opponent: true}};
        case game.UNSET_READY_OPPONENT:
            return { ...state, ready: { ...state.ready, opponent: false}};
        case game.UNSET_READY_ALL:
            return { ...state, ready: { my: false, opponent: false}};
        default:
            return state;
            break;
    }
}
export default gameRDS;