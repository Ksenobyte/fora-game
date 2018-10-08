import React,{ PureComponent } from "react";
import {connect} from "react-redux";

@connect(state=>({
    opponent: state.game.score.opponent,
    my: state.game.score.my
}))
export default class Score extends PureComponent {
    render() {
        return <div className="interface__score">
            <div className="interface__score-opponent">
                {this.props.opponent}
            </div>
            <div className="interface__score-separator"></div>
            <div className="interface__score-my">
                {this.props.my}
            </div>
        </div>;
    }
}