$(function() {
  // ソケットへの接続
  // let socket = io.connect();
  // let chat = io.connect('http://localhost:3000/chat', { transports: ["xhr-polling"], port: 3001 });
  // let fortune = io.connect('http://localhost:3000/fortune', { transports: ["xhr-polling"], port: 3001 });
  const HOST = '133.130.91.178';
  let chat = io(`http://${HOST}/chat`);
  let fortune = io(`http://${HOST}/fortune`);
  let isEnter = false;
  let name = '';

  chat.on('server_to_client', function(data){
    prependMsg(data.value);
  });

  fortune.on('server_to_client', function(data){
    appendFortune(data.value);
  });

  function prependMsg(text) {
    $('#chatLogs').prepend('<div>' + text + '</div>');
  }

  function appendFortune(text) {
    $('#fortune').append('<div>' + text + '</div>');
  }

  $('form').submit((e) => {
    e.preventDefault();

    let message = $('#msgForm').val();
    let selectRoom = $('#rooms').val();
    $('#msgForm').val('');

    // 入室している（初回接続ではない）場合
    if(isEnter) {
      message = `[${name}]: ${message}`;
      chat.emit('client_to_server', {value : message} );
    }
    // 入室していない（初回接続である）場合
    else {
      name = message;
      let entryMessage = `${name}さんが入室しました。`;
      chat.emit("client_to_server_join", {value : selectRoom});
      // client_to_server_broadcastイベント発火
      chat.emit('client_to_server_broadcast', { value: entryMessage });
      // client_to_server_personalイベント発火
      chat.emit("client_to_server_personal", { 'name' : name });
      changeLabel();
    }
  });

  function changeLabel() {
    $(".nameLabel").text("メッセージ：");
    $("#rooms").prop("disabled", true);
    $("button").text("送信");
    isEnter = true;
  }
}());