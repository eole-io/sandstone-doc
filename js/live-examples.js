window.addEventListener('load', function () {
    const faked = () => {
        return {
            chatSend: () => {
                console.log('SEND');

                const message = document.querySelector('input.chat-input').value;

                document.querySelector('input.chat-input').value = '';
                document.querySelector('.chat-output').innerHTML = message + '<br>' + document.querySelector('.chat-output').innerHTML;
            },

            pushPost: (name) => {
                if (!name) {
                    name = 'world';
                }

                const message = 'Someone called Rest Api /api/hello. Hello ' + name + ' !'

                document.querySelector('.push-output').innerHTML = message + '<br>' + document.querySelector('.push-output').innerHTML;
            },
        }
    };

    const live = (chatWs, pushApi, pushWs) => {
        let chatSession = null;

        function onChatSessionOpen(session) {
            chatSession = session;

            session.subscribe('chat/demo', function (topic, event) {
                document.querySelector('.chat-output').innerHTML = event.message + '<br>' + document.querySelector('.chat-output').innerHTML;
            });
        }

        function onPushSessionOpen(session) {
            session.subscribe('push/demo', function (topic, event) {
                document.querySelector('.push-output').innerHTML = event.message + '<br>' + document.querySelector('.push-output').innerHTML;
            });
        }

        function onError(code, reason, detail) {
            console.warn('error', code, reason, detail);
        }

        ab.connect(chatWs, onChatSessionOpen, onError);
        ab.connect(pushWs, onPushSessionOpen, onError);

        return {
            chatSend: () => {
                chatSession.publish('chat/demo', document.querySelector('input.chat-input').value);
                document.querySelector('input.chat-input').value = '';
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
    const interface = live('ws://alcalyn.tru.io:25569', 'http://alcalyn.tru.io:8480', 'ws://alcalyn.tru.io:25570');

    document.querySelector('.input-group-chat button').addEventListener('click', interface.chatSend);

    document.querySelector('.post-api-hello').addEventListener('click', () => interface.pushPost());
    document.querySelector('.post-api-hello-sandstone').addEventListener('click', () => interface.pushPost('sandstone'));

});
