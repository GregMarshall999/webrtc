let handleMemberJoined = async memberId => {
    console.log(`Member: ${memberId} joined the room`);
    addMemberToDom(memberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);

    let { name } = await rtmClient.getUserAttributesByKeys(memberId, ['name']);
    addBotMessageToDom(`Welcome to the room ${name}! 👋`);
}

let addMemberToDom = async memberId => {
    let { name } = await rtmClient.getUserAttributesByKeys(memberId, ['name']);

    let membersWrapper = document.getElementById('member_list')
    let memberItem = `<div class="member_wrapper" id="member_${memberId}_wrapper">
                        <span class="green_icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`;

    membersWrapper.insertAdjacentHTML('beforeend', memberItem);
}

let updateMemberTotal = async members => {
    let total = document.getElementById('members_count');
    total.innerText = members.length;
}

let handleMemberLeft = async memberId => {
    removeMemberFromDom(memberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);
}

let removeMemberFromDom = async memberId => {
    let memberWrapper = document.getElementById(`member_${memberId}_wrapper`);
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotMessageToDom(`${name} has left the room.`)

    memberWrapper.remove();
}

let getMembers = async () => {
    let members = await channel.getMembers();
    updateMemberTotal(members);

    for(let i = 0; i < members.length; i++) {
        addMemberToDom(members[i]);
    }
}

let handleChannelMessage = async (messageData, memberId) => { //TODO check usage of memberId
    console.log('A new message was received');
    let data = JSON.parse(messageData.text);

    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message);
    }

    if(data.type === 'user_left'){
        document.getElementById(`user-container-${data.uid}`).remove();

        if(userIdInDisplayFrame === `user-container-${uid}`){
            displayFrame.style.display = null;
    
            for(let i = 0; videoFrames.length > i; i++){
                videoFrames[i].style.height = '300px';
                videoFrames[i].style.width = '300px';
            }
        }
    }
}

let sendMessage = async e => {
    e.preventDefault();

    let message = e.target.message.value;
    channel.sendMessage({ text:JSON.stringify({ 'type':'chat', 'message':message, 'displayName':displayName }) });
    addMessageToDom(displayName, message);
    e.target.reset();
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = `<div class="message_wrapper">
                        <div class="message_body">
                            <strong class="message_author">${name}</strong>
                            <p class="message_text">${message}</p>
                        </div>
                    </div>`;

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = document.querySelector('#messages .message_wrapper:last-child');
    if(lastMessage){
        lastMessage.scrollIntoView();
    }
}


let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = `<div class="message_wrapper">
                        <div class="message_body_bot">
                            <strong class="message_author_bot">🤖 Mumble Bot</strong>
                            <p class="message_text_bot">${botMessage}</p>
                        </div>
                    </div>`;

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = document.querySelector('#messages .message_wrapper:last-child');
    if(lastMessage){
        lastMessage.scrollIntoView();
    }
}

let leaveChannel = async () => {
    await channel.leave();
    await rtmClient.logout();
}

window.addEventListener('beforeunload', leaveChannel);
let messageForm = document.getElementById('message_form');
messageForm.addEventListener('submit', sendMessage);