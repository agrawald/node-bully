var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');
var blackjack = require('./lib/blackjack');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));

io.on('connection', function (socket) {
    console.log('User connected');
    socket.game = blackjack.newGame();

    socket.on('deal', function (data) {
        deal(socket, data);
    });

    socket.on('hit', function (data) {
        hit(socket, data);
    });

    socket.on('stand', function (data) {
        stand(socket, data);
    });

    socket.on('disconnect', function (socket) {
        console.log('User disconnected');
    });
});

http.listen(3000);

var deal = function (socket, data) {
    console.log('deal');
    var game = socket.game;
    if (!game.isInProgress()) {
        game.newGame();
    }
    socket.emit('deal', game.toJson());
};

var hit = function (socket, data) {
    console.log('hit');
    var game = socket.game;
    game.hit();
    socket.emit('hit', game.toJson());
};

var stand = function (socket, data) {
    console.log('stand');
    var game = socket.game;
    game.stand();
    socket.emit('stand', game.toJson());
};

