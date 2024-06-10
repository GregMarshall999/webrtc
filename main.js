//TODO: create signaling server backend (build signaling server)

const APP_ID = "ec50216c11144505a73823ced15d3f80";

let token = null;
let uid = String(Math.floor(Math.random() * 10000)); //replace by user ID of the current connected user

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}

let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID); //TODO: adapt to latest version
    await client.login({ uid, token });

    channel = client.createChannel('main');
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)

    client.on('MessageFromPeer', handleMessageFromPeer);

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById('user-1').srcObject = localStream;
}

let createOffer = async memberId => {
    await createPeerConnection(memberId);

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type':'offer', 'offer':offer }) }, memberId);
}

let createAnswer = async (memberId, offer) => {
    await createPeerConnection(memberId);

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type':'answer', 'answer':answer }) }, memberId);
}

let createPeerConnection = async memberId => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    if(!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        document.getElementById('user-1').srcObject = localStream;
    }

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = async event => {
        if(event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type':'candidate', 'candidate':event.candidate }) }, memberId);
        }
    };
}

let addAnswer = async answer => {
    if(!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
} 

let handleUserJoined = async memberId => {
    console.log('A new user joined the channel:', memberId);
    createOffer(memberId);
}

let handleMessageFromPeer = async (message, memberId) => {
    msg = JSON.parse(message.text);

    if(msg.type === 'offer') {
        createAnswer(memberId, msg.offer);
    }
    
    if(msg.type === 'answer') {
        addAnswer(msg.answer);
    }
    
    if(msg.type === 'candidate') {
        if(peerConnection) {
            peerConnection.addIceCandidate(msg.candidate);
        }
    }
}

init();