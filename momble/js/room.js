let messagesContainer = document.getElementById('messages');
messagesContainer.scrollTop = messagesContainer.scrollHeight;

const memberContainer = document.getElementById('members_container');
const memberButton = document.getElementById('members_button');

const chatContainer = document.getElementById('messages_container');
const chatButton = document.getElementById('chat_button');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } 
  else {
    memberContainer.style.display = 'block';
  }

  activeMemberContainer = !activeMemberContainer;
});

let activeChatContainer = false;

chatButton.addEventListener('click', () => {
  if (activeChatContainer) {
    chatContainer.style.display = 'none';
  } 
  else {
    chatContainer.style.display = 'block';
  }

  activeChatContainer = !activeChatContainer;
});