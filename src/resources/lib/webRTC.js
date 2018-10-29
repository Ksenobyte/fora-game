//выделил весь код связанный с чатом в отдельный модуль, что бы держать все максимально компактно и независимо
export default class webRTCInterface {

    PeerConnection = window.RTCPeerConnection;
    SessionDescription = window.RTCSessionDescription;
    IceCandidate = window.RTCIceCandidate;

    peers = [];
    //сервера для обхода NAT
    server = {
        iceServers: [
            // {urls: "stun:23.21.150.121"},
            {urls: "stun:stun.12connect.com:3478"},
            {urls: "turn:numb.viagenie.ca", credential: "JSLsmpKwN4B8hQee", username: "ksenobyte95@gmail.com"}
        ]
    };

    options = {
        optional: [
            {DtlsSrtpKeyAgreement: true}, // требуется для соединения между Chrome и Firefox
            {RtpDataChannels: true} // требуется в Firefox для использования DataChannels API
        ]
    }

    //получаем из основной программы все необходимые данные
    constructor(socket_connection, id , onChOpenCallback, onChMessCallback, addChatView) {
        this.socket = socket_connection;
        this.myId = id;
        this.addChatView = addChatView;
        this.bindEvents = channel => {
            channel.onopen = () => {
                onChOpenCallback();
            };
            channel.onmessage = e => {
                let data = JSON.parse(e.data)
                onChMessCallback(channel.label, data);
            };
        }
    }


    async socketNewPeer(data) {
        this.peers[data] = {
            candidateCache: []
        };
        // Создаем новое подключение
        let pc = new this.PeerConnection(this.server, this.options);
        // Инициализируем его
        this.initConnection(pc, data, "offer");
        // Сохраняем пира в списке пиров
        this.peers[data].connection = pc;

        // Создаем DataChannel по которому и будет происходить обмен сообщениями
        this.createChannel('global', data);

        // Создаем SDP offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
    }

    createChannel(id, owner) {

        if (this.peers[owner].channels === undefined) {
            this.peers[owner].channels = []
        }
        let channel = this.peers[owner].connection.createDataChannel(id, {});
        channel.owner = owner;
        //записываем в список каналов текущего пользователя
        this.peers[owner].channels[id] = channel;

        // Устанавливаем обработчики событий канала
        this.bindEvents(channel);
        if (id !== 'global') {//добавляем новую вкладку чата только если это не глобальный чат
            let chatObj = {};
            chatObj[id] = [];
            this.addChatView({ id, name: id }, chatObj);
        }

    }

    socketReceived( {type, id, data} ) {
        switch (type) {
            case "candidate":
                this.remoteCandidateReceived(id, data);
                break;
            case "offer":
                this.remoteOfferReceived(id, data);
                break;
            case "answer":
                this.remoteAnswerReceived(id, data);
                break;
        }
    }


    sendMessage (msg, owner, channel = 'global') {
        for (let peer in this.peers) {
            if (this.peers.hasOwnProperty(peer)) {
                if (this.peers[peer].channels[channel] !== undefined) {
                    try {
                        this.peers[peer].channels[channel].send(JSON.stringify({ text: msg, owner: owner}));
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        }

    }

    closeChannels() {
        for (let peer in this.peers) {
            if (this.peers.hasOwnProperty(peer)) {
                if (this.peers[peer].channels !== undefined) {
                    for (let channel of this.peers[peer].channels) {
                        try {
                            channel.close();
                        } catch (e) {}
                    }

                }
            }
        }
    }

    initConnection(pc, id, sdpType) {
        pc.onicecandidate =  (event) => {
            if (event.candidate) {
                // При обнаружении нового ICE кандидата добавляем его в список для дальнейшей отправки
                this.peers[id].candidateCache.push(event.candidate);
            } else {
                // Когда обнаружение кандидатов завершено, обработчик будет вызван еще раз, но без кандидата
                // В этом случае мы отправялем пиру сначала SDP offer или SDP answer (в зависимости от параметра функции)...
                this.sendViaSocket(sdpType, pc.localDescription, id);
                // ...а затем все найденные ранее ICE кандидаты
                for (let i = 0; i < this.peers[id].candidateCache.length; i++) {
                    this.sendViaSocket("candidate", this.peers[id].candidateCache[i], id);
                }
            }
        }
        pc.oniceconnectionstatechange = (event) => {
            if (pc.iceConnectionState == "disconnected") {
                delete this.peers[id];
            }
        }
    }



    async remoteOfferReceived(id, data) {
        this.createConnection(id);
        let pc = this.peers[id].connection;

        pc.setRemoteDescription(new this.SessionDescription(data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
    }

    createConnection(id) {
        if (this.peers[id] === undefined) {
            this.peers[id] = {
                candidateCache: []
            };
            let pc = new this.PeerConnection(this.server, this.options);
            this.initConnection(pc, id, "answer");

            this.peers[id].connection = pc;
            //сохраняем пришедший канал данных
            pc.ondatachannel = (e) => {
                if (this.peers[id].channels === undefined) {
                    this.peers[id].channels = []
                }
                let chId = e.channel.label;
                this.peers[id].channels[chId] = e.channel;
                this.peers[id].channels[chId].owner = id;
                this.bindEvents(this.peers[id].channels[chId]);
                if (chId !== 'global') {//добавляем новую вкладку чата только если это не глобальный чат
                    let chatObj = {};
                    chatObj[chId] = [];
                    this.addChatView({ id: chId, name: chId }, chatObj);
                }
            }
        }
    }

    remoteAnswerReceived(id, data) {
        let pc = this.peers[id].connection;
        pc.setRemoteDescription(new this.SessionDescription(data));
    }

    remoteCandidateReceived(id, data) {
        this.createConnection(id);
        let pc = this.peers[id].connection;
        pc.addIceCandidate(new this.IceCandidate(data));
    }

    sendViaSocket(type, message, to) {
        this.socket.emit("webrtc", {id: this.myId, to: to, type: type, data: message});
    }

}