import {combineReducers} from "redux";

import gameRDS from "./gameRDS";
import constantsRDS from "./constantsRDS";

export default combineReducers({
    game: gameRDS,
    constants: constantsRDS
});
