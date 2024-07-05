const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/gs-guide-websocket'
});

stompClient.onConnect = frame => {
    setConnected(true);
    console.log('Connected:', frame);
    stompClient.subscribe('/topic/greetings', tests => {
        showGreeting(JSON.parse(tests.body).content);
    });
};

stompClient.onWebSocketError = error => {
    console.log('Error with websocket', error);
};

stompClient.onStompError = frame => {
    console.log('Broker reported error:', frame.headers['message']);
    console.log('Additional details:', frame.body);
};

function setConnected(connected) {
    $('#connect').prop("disabled", connected);
    $('#disconnect').prop("disabled", !connected);

    if(connected) {
        $('#conversation').show();
    }
    else {
        $('#conversation').hide();
    }

    $('#greetings').html('');
}

function connect() {
    stompClient.activate();
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log('Disconnected');
}

function sendName() {
    stompClient.publish({
        destination: '/app/hello',
        body: JSON.stringify({ 'name': $('#name').val() })
    });
}

function showGreeting(message) {
    $('#greetings').append("<tr><td>" + message + "</td></tr>");
}

$(function () {
    $('form').on('submit', e => e.preventDefault());
    $('#connect').click(() => connect());
    $('#disconnect').click(() => disconnect());
    $('#send').click(() => sendName());
});