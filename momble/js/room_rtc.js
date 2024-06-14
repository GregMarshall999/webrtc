const APP_ID = "63d7c9991e164fea81b38210ac0792c9";

let uid = sessionStorage.getItem('uid');
if(!uid) {
    uid = String(Math.floor(Math.random() * 10000));
    sessionStorage.setItem('uid', uid);
}

let token = null;
let client;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if(!roomId) {
    roomId = 'main';
}

let localTracks = [];
let remoteUsers = {};

let joinRoomInit = async () => {
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    await client.join(APP_ID, roomId, token, uid);

    client.on('user-published', handleUserPublished);
    client.on('user-left', handleUserLeft);

    joinStream();
}

let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `  <div class="video_container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"></div>
                    </div>`;

    document.getElementById('streams_container').insertAdjacentHTML('beforeend', player);
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);

    localTracks[1].play(`user-${uid}`);
    await client.publish([localTracks[0], localTracks[1]]);
}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user;

    await client.subscribe(user, mediaType);

    let player = document.getElementById(`user-container-${user.uid}`);

    if(player === null) {
        player = `  <div class="video_container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div>
                    </div>`;

        document.getElementById('streams_container').insertAdjacentHTML('beforeend', player);
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame);
    }

    if(displayFrame.style.display) {
        player.style.height = '100px';
        player.style.width = '100px';
    }

    if(mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`);
    }

    if(mediaType === 'audio') {
        user.audioTrack.play(); //may need the video div id
    }
}

let handleUserLeft = async user => {
    delete remoteUsers[user.uid];
    document.getElementById(`user-container-${user.uid}`).remove();

    if(userIdInDisplayFrame === `user-container-${user.uid}`) {
        displayFrame.style.display = null;
        let videoFrames = document.getElementsByClassName('video_container');

        for(let i = 0; i < videoFrames.length; i++) {
            videoFrames[i].style.height = '300px';
            videoFrames[i].style.width = '300px';
        }
    }
}

joinRoomInit();