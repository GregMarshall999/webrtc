import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

const socket = io('http://localhost:3000', {
    transports: ['websocket', 'polling', 'flashsocket'],
    cors: {
        origin: 'http://localhost:3000', 
        credential: true
    }, 
    withCredentials: true
});

const pc_config = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
};

const peerConnection = new RTCPeerConnection(pc_config);

/*
socket.on('connect', () => {
    console.log('Successfully connected to signaling server');
});

socket.on('room_users', data => {
    console.log('join: ', data);
    createOffer();
});

const createOffer = () => {
    console.log('create offer'); 
    peerConnection
        .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then(sdp => {
            peerConnection.setLocalDescription(sdp);
            socket.emit('offer', sdp);
        })
        .catch(error => {
            console.log(error);
        });
};

socket.on('getOffer', sdp => {
    console.log('get Offer: ', sdp);
    createAnswer(sdp);
});

const createAnswer = sdp => {
    peerConnection.setRemoteDescription(sdp).then(() => {
        console.log('Aswer set remote description success');
        peerConnection
            .createAnswer({
                offerToReceiveVideo: true, 
                offerToReceiveAudio: true
            })
            .then(sdp1 => {
                console.log('Create Answer');
                peerConnection.setLocalDescription(sdp1);
                socket.emit('answer', sdp1);
            })
            .catch(error => {
                console.log(error);
            });
    });
};

socket.on('getAnswer', sdp => {
    console.log('get anwser: ', sdp);
    peerConnection.setRemoteDescription(sdp);
});

peerConnection.onicecandidate = e => {
    if(e.candidate) {
        console.log('onIceCandidate');
        socket.emit('candidate', e.candidate);
    }
};

peerConnection.oniceconnectionstatechange = e => {
    console.log(e);
};

socket.on('getCandidate', candidate => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
        console.log('candidate add success');
    });
});

navigator.mediaDevices
    .getUserMedia({
        video: true, 
        audio: true 
    })
    .then(stream => {
        if(localVideo.current) localVideo.current.srcObject = stream;

        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });
    });

peerConnection.ontrack = ev => {
    console.log('Add RemoteTrack Success');
    if(remoteVideo.current) 
        remoteVideo.current.srcObject = ev.stream[0];
}

socket.emit('join', {
    room: '1234', 
    name: 'skydoves@getstream.io'
});
*/

async function init(e) {
    console.log("render videos");
    try {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then(stream => {
                if (localVideo.current) localVideo.current.srcObject = stream;

                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream);
                });

                peerConnection.onicecandidate = e => {
                    if (e.candidate) {
                        console.log("onicecandidate");
                        socket.emit("candidate", e.candidate);
                    }
                };

                peerConnection.oniceconnectionstatechange = e => {
                    console.log(e);
                };

                peerConnection.ontrack = ev => {
                    console.log("add remotetrack success");
                    if (remoteVideo.current)
                        remoteVideo.current.srcObject = ev.streams[0];
                };

                socket.emit("join", {
                    room: "1234",
                    name: "skydoves@getstream.io",
                });
            })
            .catch(error => {
                console.log(`getUserMedia error: ${error}`);
            });
    } catch (e) {
        console.log(e);
    }
}

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
document.querySelector('#join').addEventListener('click', e => init(e));