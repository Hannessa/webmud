$(function() {
    // initial variables
    const $window = $(window);
    const $terminalElement = $('.messages');
    const $inputElement = $('.inputMessage');
    const socket = io();

    let connected = false;

    // set up terminal
    const term = new Terminal({
        convertEol: true,
        rows: 40
    });
    term.open($terminalElement[0]);
    term.write("\n");

    $inputElement.focus();

    // sends a chat message
    function sendMessage () {
        let message = $inputElement.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputElement.val('');
            if ($('.inputMessage').prop("type") == "password") {
                // Password entered
                terminalOutput({
                    msg: '> *******'
                });
            } else {
                // Normal command
                terminalOutput({
                    msg: '> ' + message
                });
            }

            // Send message to server
            // tell server to execute 'new message' and send along one parameter
            socket.emit('input', {"msg": message});
        }
    }

    // add output to terminal
    function terminalOutput (data) {
        term.write(data.msg + "\n")
    }

    // prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).text();
    }

    // - keyboard events

    $window.keydown(function (event) {
        // auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $inputElement.focus();
        }
        // ENTER key event
        if (event.which === 13) {
            sendMessage();
        }
    });

    // - click events

    // Focus input when clicking on the message input's border
    $inputElement.click(function () {
        $inputElement.focus();
    });

    // - socket events

    // whenever the server emits 'output', update the chat body
    socket.on('output', function (data) {
        connected = true;
        data.msg = "\n" + data.msg + "\n";

        // If we expect password in return
        if (data.password) {
            $('.inputMessage').prop("type", "password");
        } else {
            $('.inputMessage').prop("type", "text");
        }

        terminalOutput(data);
    });
});
