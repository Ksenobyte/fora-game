import React from 'react'

import Score from './Score';
import PlayerArea from './PlayerArea';
import Chat from './chat/Chat';


const GameArea = () => (
    <div className="interface">
        <PlayerArea entity={"opponent"}/>

        <Score/>

        <PlayerArea entity={"my"}/>

    </div>
)

export default GameArea
