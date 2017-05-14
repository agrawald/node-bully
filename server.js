"use strict";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const url = require('url');
const blackjack = require('./lib/blackjack');
const player = require('./lib/player');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));

const playerSockets = [];
let playerCount = -1;
let game;
const players = [];
let playersReady = -1;

const turn = function () {
    if (players) {
        let whosTurn = 1;
        for (let i = 0; i < players.length; i++) {
            if (!players[i].isDealer && players[i].myTurn) {
                whosTurn = i + 1 === (players.length) ? 1 : i + 1;
            }
        }
        playerSockets[whosTurn].emit('turn', whosTurn);
    }
};
const playersJson = function (players, currentPlayerId) {
    const json = [];
    for (let i = 0; i < players.length; i++) {
        json.push(players[i].toJson(currentPlayerId))
    }
    return json;
};
const sendPlayerUpdates = function (event, players) {
    if (playerSockets && playerSockets.length > 0) {
        for (let i = 0; i < playerSockets.length; i++) {
            if (playerSockets[i]) {
                playerSockets[i].emit(event, {players: playersJson(players, i)});
            }
        }
    }
};
const addPlayer = function (socket) {
    let mayBeNewPlayer = players[socket.id];
    if (mayBeNewPlayer) {
        console.log(`${mayBeNewPlayer.name} -> RECONNECTED`)
    } else {
        ++playerCount;
        socket.id = playerCount;

        mayBeNewPlayer = player.newPlayer(playerCount, "Player " + playerCount);
        console.log(`${mayBeNewPlayer.name} -> CONNECTED`);
    }

    playerSockets[playerCount] = socket;
    players[playerCount] = mayBeNewPlayer;
    socket.emit('id', {
        id: playerCount,
        players: playersJson(players, playerCount),
        inProgress: !!game
    });
    sendPlayerUpdates('newPlayer', players);
};
const removePlayer = function (playerId) {
    console.log('User ' + playerId + ' disconnected');
    playerSockets.splice(playerId, 1);
    players.splice(playerId, 1);
    if (game) {
        game.removePlayer(playerId);
    }
    playerCount--;
    sendPlayerUpdates('drop', players);
};
const deal = function (socket, data) {
    console.log('deal');
    if (!game.isInProgress()) {
        game.start();
    }
    sendGameUpdate("deal", game)
};
const hit = function (socket, data) {
    console.log('hit');
    game.hit(socket.id);
    let result = game.getResult(socket.id)
    if (result) {
        players.splice(socket.id, 1);
    }
    sendGameUpdate("hit", game);
};
const stand = function (socket, data) {
    console.log('stand');
    game.stand(socket.id);
    let result = game.getResult(socket.id)
    if (result) {
        players.splice(socket.id, 1);
    }
    sendGameUpdate("stand", game);
};
io.on('connection', function (socket) {
    socket.on('start', function (data) {
        playersReady++;
        if (playersReady === playerCount) {
            game = blackjack.newGame(players);
            game.start();
            deal(socket, data);
            turn();
        } else {
            console.log("Game is in progress")
        }
    });

    socket.on('hit', function (data) {
        hit(socket, data);
        turn();
    });

    socket.on('stand', function (data) {
        stand(socket, data);
        turn();
    });

    socket.on('disconnect', function () {
        removePlayer(this.id);
    });

    addPlayer(socket);
});

http.listen(3000);


const sendGameUpdate = function (event, game) {
    if (playerSockets && playerSockets.length > 0) {
        for (let i = 0; i < playerSockets.length; i++) {
            if (playerSockets[i]) {
                playerSockets[i].emit(event, game.toJson(i));
            }
        }
    }
};



