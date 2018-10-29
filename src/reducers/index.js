import {combineReducers} from "redux";

import gameRDS from "./gameRDS";
import constantsRDS from "./constantsRDS";
import chatsRDS from "./chatsRDS";

export default combineReducers({
    game: gameRDS,
    constants: constantsRDS,
    chats: chatsRDS
});
