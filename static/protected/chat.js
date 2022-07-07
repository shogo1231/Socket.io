$(function() {
  let socket = io.connect();
  let isEnter = false;
  let name = '';

  socket.on('server_to_client', function(data){
    appendMsg(data.value);
  });

  function appendMsg(text) {
    $('#chatLogs').append('<div>' + text + '</div>');
  }

  $('form').submit((e) => {
    e.preventDefault();

    let message = $('#msgForm').val();
    $('#msgForm').val('');

    // 入室している（初回接続ではない）場合
    if(isEnter) {
      message = `[${name}]: ${message}`;
      socket.emit('client_to_server', {value : message} );
    }
    // 入室していない（初回接続である）場合
    else {
      name = message;
      let entryMessage = `${name}さんが入室しました。`;
      // client_to_server_broadcastイベント発火
      socket.emit('client_to_server_broadcast', { value: entryMessage });
      changeLabel();
    }
  });

  function changeLabel() {
    $('label').text('メッセージ：');
    $('button').text('送信');
    isEnter = true;
  }

}());