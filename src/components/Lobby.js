import React from 'react'


const Lobby = ({serverConsts, inviteCode, clickEventHandler}) => (
    <div className="lobby">
        <div className="lobby__wrapper">
            <span className="lobby__status">Ожидание подключения второго игрока...</span>
            <span className="lobby__clipboard">
                <p className="lobby__clipboard-text">Нажмите, что бы скопировать ссылку приглашения:</p>
                <p className="lobby__clipboard-link" onClick={clickEventHandler}>{`${serverConsts.protocol}://${serverConsts.adress}:${serverConsts.port}/${inviteCode}`}</p>
            </span>
        </div>
    </div>
)

export default Lobby