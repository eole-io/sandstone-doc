window.addEventListener('load', function () {
    const faked = () => {
        return {
            chatSend: () => {
                const message = document.querySelector('input.chat-input').value;

                if ('' === message) {
                    return;
                }

                chatClear();
                chatDisplay(message);
            },

            pushPost: (name) => {
                if (!name) {
                    name = 'world';
                }

                pushDisplay('Someone called Rest Api /api/hello. Hello ' + name + ' !');
            },
        }
    };

    const live = (chatWs, pushApi, pushWs) => {
        let chatSession = null;

        function onChatSessionOpen(session) {
            chatSession = session;

            session.subscribe('chat/demo', function (topic, event) {
                chatDisplay(event.message);
            });
        }

        function onPushSessionOpen(session) {
            session.subscribe('push/demo', function (topic, event) {
                pushDisplay(event.message);
            });
        }

        function onError(code, reason, detail) {
            console.warn('error', code, reason, detail);
        }

        ab.connect(chatWs, onChatSessionOpen, onError);
        ab.connect(pushWs, onPushSessionOpen, onError);

        return {
            chatSend: () => {
                const message = document.querySelector('input.chat-input').value;

                if ('' === message) {
                    return;
                }

                chatSession.publish('chat/demo', message);
                chatClear();
            },

            pushPost: (name) => {
                let path = '/api/hello';

                if (name) {
                    path = '/api/hello/' + name;
                }

                jQuery.post(pushApi + path);
            },
        };
    };

    // Mock
    //const interface = faked();

    // Local instance (https://github.com/eole-io/sandstone-doc-live)
    //const interface = live('ws://0.0.0.0:25569', 'http://0.0.0.0:8480', 'ws://0.0.0.0:25570');

    // Production instance
    //const interface = live('ws://alcalyn.nsupdate.info:25569', 'http://alcalyn.nsupdate.info:8480', 'ws://alcalyn.nsupdate.info:25570');

    // Production instance TLS
    const interface = live('wss://alcalyn.nsupdate.info:26569', 'https://alcalyn.nsupdate.info:9480', 'wss://alcalyn.nsupdate.info:26570');

    document.querySelector('.input-group-chat button').addEventListener('click', interface.chatSend);
    document.querySelector('.input-group-chat .chat-input').addEventListener('keypress', e => {
        if (13 === e.keyCode) {
            interface.chatSend();
        }
    });

    document.querySelector('.post-api-hello').addEventListener('click', () => interface.pushPost());
    document.querySelector('.post-api-hello-sandstone').addEventListener('click', () => interface.pushPost('sandstone'));

    function chatDisplay(message) {
        document.querySelector('.chat-output').innerHTML = '<br>' + document.querySelector('.chat-output').innerHTML;
        document.querySelector('.chat-output').innerText = message + document.querySelector('.chat-output').innerText;
    }

    function chatClear() {
        document.querySelector('input.chat-input').value = '';
    }

    function pushDisplay(message) {
        document.querySelector('.push-output').innerHTML = message + '<br>' + document.querySelector('.push-output').innerHTML;
    }
});
