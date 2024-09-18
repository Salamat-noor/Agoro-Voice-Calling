import './style.css'
import appID from './utils'
import AgoraRTC from 'agora-rtc-sdk-ng'

const roomname = document.getElementById("roomname");
const username = document.getElementById("username");
const form = document.getElementById("form");
const roomHeader = document.getElementById("room-header");
const members = document.getElementById('members');
const leaveIcon = document.getElementById("leave-icon");
const uniquePlaceholder = Math.floor(Math.random() * 2032);

const token = null;
const appid = appID;
let rtcUid = `#${uniquePlaceholder} `;
let roomid;

let audioTracks = {
    localAudioTrack: null,
    remoteAudioTracks: {}
}

let rtcClient;

let initRTC = async () => {
    rtcUid = `${username.value} ${rtcUid}`;
    roomid = roomname.value;

    rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    rtcClient.on('user-joined', handleUserJoined);
    rtcClient.on('user-published', handleUserpublish);
    rtcClient.on("user-left", handleUserLeft);
    await rtcClient.join(appid, roomid, token, rtcUid);
    audioTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtcClient.publish(audioTracks.localAudioTrack);

    let member = `
                <div class='speaker user-${rtcUid}' id='${rtcUid}'> 
                    <span>${rtcUid}</span>
                </div>
    `;
    members.insertAdjacentHTML('beforeend', member);
}

const handleUserJoined = async (user) => {
    console.log("New user joined: ", user)

    let member = `
                <div class='speaker user-${user.uid}' id='${user.uid}'> 
                    <span>${user.uid}</span>
                </div>
    `;
    members.insertAdjacentHTML('beforeend', member);
}

const handleUserpublish = async (user, mediatype) => {
    await rtcClient.subscribe(user, mediatype);

    if (mediatype === 'audio') {
        audioTracks.remoteAudioTracks[user.uid] = [user.audioTrack];
        user.audioTrack.play();
    }

}

const handleUserLeft = async (user) => {
    delete audioTracks.remoteAudioTracks[user.uid];
    document.getElementById(user.uid).remove();
}

const enterRoom = async (e) => {
    e.preventDefault();
    if (roomname.value && username.value) {
        initRTC();

        form.style.display = 'none';
        roomHeader.style.display = 'flex';
    }
}
const leaveRoom = async () => {
    audioTracks.localAudioTrack.stop();
    audioTracks.localAudioTrack.close();

    rtcClient.unpublish();
    rtcClient.leave();

    form.style.display = 'block';
    roomHeader.style.display = 'none';
    members.innerHTML = "";
}

form.addEventListener('submit', enterRoom);
leaveIcon.addEventListener("click", leaveRoom)