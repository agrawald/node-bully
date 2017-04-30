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

var playerSockets = [];
var playerCount = -1;

io.on('connection', function (socket) {
    console.log('User connected');
    ++playerCount;
    playerSockets[playerCount] = socket;
    socket.id = playerCount;
    if (!socket.game) {
        socket.game = blackjack.newGame();
    }

    socket.game.newPlayer(playerCount);

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
        delete playerSockets[this.id];
        var game = this.game;
        game.removePlayer(this.id);
        playerCount--;
        notifyPlayers('drop');
    });

    socket.emit('id', {
        id: playerCount,
        game: socket.game.toJson()
    });
});

http.listen(3000);

var notifyPlayers = function(event) {
    if(playerSockets && playerSockets.length>0) {
        for(var i=0; i<playerSockets.length; i++) {
            playerSockets[i].emit(event, game.toJson());
        }
    }
};

var deal = function (socket, data) {
    console.log('deal');
    var game = socket.game;
    if (!game.isInProgress()) {
        game.start();
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

