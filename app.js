const express = require("express");
const cookie = require("cookie-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const http = require('http');
const socketio = require('socket.io');

const app  = express();
const PORT = 3000;

// テンプレートエンジンをEJSに設定
// 複数サイトがある場合は第2、第3引数にpathを記述
app.set('views', './views');
app.set('view engine', 'ejs');

// public配下の静的ファイルは無条件に公開
app.use('/static', express.static(__dirname+'/static'));

// ミドルウエアの設定
app.use(cookie());
app.use(session({
  secret: "YOUR SECRET SALT",
  resave: false, 
  saveUninitialized: true,
  rolling : true,
  cookie:{
    httpOnly: true, // クライアント側でクッキー値を見れない、書きかえれないようにするオプション
    secure: false, // httpsで使用する場合はtrueにする。今回はhttp通信なのでfalse
    maxAge: 1000 * 60 * 30 // セッションの消滅時間。単位はミリ秒。ミリ秒は千分の一秒なので1000 * 60 * 30で30分と指定。
  },
  store: new FileStore({
    ttl: 30 * 86400
  }),
}));

// req.bodyをとるために必要
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ソケット通信を行うための設定
let server = http.createServer(app);
const io = socketio(server);

// HTTPサーバ接続
server.listen(PORT, () => {
  app.use('/', require('./routes/chat.js'));
  console.log(`Listening on ${PORT}`);
});

// クライアントとのコネクションが確立した時の処理
io.on('connection', (socket) => {
  let name;

  socket.on('client_to_server', (message) => {
    console.log('Message has been sent: ', message);
    // 'server_to_client' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.emit('server_to_client', message);
  });

  // client_to_server_broadcastイベント・データを受信し、送信元以外に送信する
  socket.on('client_to_server_broadcast', function(data) {
    socket.broadcast.emit('server_to_client', {value : data.value});
  });

  // client_to_server_personalイベント・データを受信し、送信元だけに送信する
  socket.on('client_to_server_personal', function(data) {
    const id = socket.id;
    name = data.name;
    let personalMessage = `あなたは、${name}さんとして入室しました。`;
    io.to(id).emit('server_to_client', {value : personalMessage})
});

});