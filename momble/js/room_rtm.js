let handleMemberJoined = async (memberId) => {
    console.log(memberId);
    addMemberToDom(memberId);
}

let handleMemberLeft = async (memberId) => {
    removeMemberFromDom(memberId);
}

let addMemberToDom = async (memberId) => {
    let membersWrapper = document.getElementById('member_list');

    let memberItem = `<div class="member_wrapper" id="member_${memberId}_wrapper">
                            <span class="green_icon"></span>
                            <p class="member_name">${memberId}</p>
                        </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem);
}

let removeMemberFromDom = async (memberId) => {
    let memberWrapper = document.getElementById(`member_${memberId}_wrapper`);
    memberWrapper.remove();
}

let leaveChannel = async () => {
    await channel.leave();
    await rtmClient.logout();
}

window.addEventListener('beforeunload', leaveChannel);