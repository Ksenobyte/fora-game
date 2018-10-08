import Lizard from "../resources/svg/Lizard";
import Rock from "../resources/svg/Rock";
import Paper from "../resources/svg/Paper";
import Scissors from "../resources/svg/Scissors";
import Spock from "../resources/svg/Spock";
import React, {PureComponent} from "react";
import {bindActionCreators} from "redux";
import * as gameActions from "../actions/game";
import * as game from "../constants/game";
import {connect} from "react-redux";

@connect(state=>({
    selectedGesture: state.game.chosenIcon,
    roundWinner: state.game.winner,
    ready: state.game.ready
}))
export default class PlayerArea extends PureComponent {

    bindedGameActions = bindActionCreators(gameActions, this.props.dispatch);

    onIconClick = (icon) => {
        return (icon) => {
            if (this.props.selectedGesture.my == null ) { //запрет на повторный выбор жеста
                this.bindedGameActions.setMyIcon(icon);
            }
        }

    }
    render() {

        let {
            entity,
            selectedGesture,
            roundWinner,
            ready
        } = this.props,
            activeGesture = {
                lizard: "",
                rock: "",
                paper: "",
                scissors: "",
                spock: "",
            };
        let GestureEffect = "";
        //определение анимации конца раунда
        if (roundWinner == game.WINNER_ME) {
            GestureEffect = (entity == "my" ? "win" : "loose");
        } else if (roundWinner == game.WINNER_OPPONENT) {
            GestureEffect = (entity == "my" ? "loose" : "win");
        } else if (roundWinner == game.WINNER_NONE) {
            GestureEffect = "loose"
        }
        //определение активного жеста и назначение ему класса для анимации
        activeGesture[selectedGesture[entity]] = `move_${entity}_${selectedGesture[entity]} ${GestureEffect}`;

        return <div className={`interface__${entity} ${ready[entity] == true ? 'interface__ready' : ''}`}>
            {
                entity == "opponent" &&
                <div className={`interface__${entity}-persona`}></div>
            }
            <div className={`interface__${entity}-icons`}>
                <Lizard className={`transition ${activeGesture.lizard}`} handler={(entity == 'my' ? this.onIconClick(): null)}/>
                <Rock className={`transition ${activeGesture.rock}`} handler={(entity == 'my' ? this.onIconClick(): null)}/>
                <Paper className={`transition ${activeGesture.paper}`} handler={(entity == 'my' ? this.onIconClick(): null)}/>
                <Scissors className={`transition ${activeGesture.scissors}`} handler={(entity == 'my' ? this.onIconClick(): null)}/>
                <Spock className={`transition ${activeGesture.spock}`} handler={(entity == 'my' ? this.onIconClick(): null)}/>
            </div>
            {
                entity == "my" &&
                <div className={`interface__${entity}-persona`}></div>
            }
        </div>;
    }
}