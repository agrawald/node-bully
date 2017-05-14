"use strict";

const socket = io();
let myId = -1;

const standResult = function (game) {
    updatePlayers(game.players);
    updateResult(game.result);
    enableDealIfGameFinished(game.result);
};

socket.on('stand', function (game) {
    standResult(game);
});

const dealResult = function (game) {
    disableButton(`#player${myId}start`);
    updatePlayers(game.players);
    updateResult(game.result);
};

socket.on('deal', function (game) {
    dealResult(game);
});

const hitResult = function (game) {
    updatePlayers(game.players);
    updateResult(game.result);
    enableDealIfGameFinished(game.result);
};
socket.on('hit', function (game) {
    hitResult(game);
});

const removePlayers = function (players) {
    for (let i = 0; i < 5; i++) {
        if (!players[i]) {
            $(`#player${i}`).remove();
        }
    }
};
const drawCards = function (divId, images) {
    const canvas = document.getElementById(divId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 500, 150);
    for (let i = 0; i < images.length; i++) {
        ctx.drawImage(images[i], i * 20, 0, 100, 150);
    }
};
const loadCardImages = function (divId, cards) {
    let loaded = 0;
    const images = [];
    if (cards && cards.length > 0) {
        for (let i = 0; i < cards.length; i++) {
            images[i] = getCardImg(cards[i]);
            images[i].onload = function () {
                if (++loaded === cards.length) {
                    drawCards(divId, images);
                }
            };
        }
    }

};
const updatePlayers = function (players) {
    if (players) {
        removePlayers(players);
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerScoreDiv = $(`#player${i}Score`);
            const playerStartButton = $(`#player${i}start`);
            playerScoreDiv.empty();
            if (player.isDealer) {
                playerScoreDiv.append(player.name + " (DEALER) <span class='badge'>" + player.score + "</span>");
                playerStartButton.removeAttr('hidden');
            } else {
                playerScoreDiv.append(player.name + " <span class='badge'>" + player.score + "</span>");
            }
            $(`#player${i}Cards`).empty();
            loadCardImages(`player${i}Cards`, player.cards);
            if (myId === i) {
                $(`#player${i}Buttons`).removeAttr('hidden');
            }
            $(`#player${i}`).removeAttr('hidden');
        }
    }
};
const registerClientActions = function () {
    $(`#player${myId}start`).click(function () {
        start();
    });

    $('#restart').click(function () {
        start();
    });

    $(`#player${myId}hit`).click(function () {
        hit();
    });

    $(`#player${myId}stand`).click(function () {
        stand();
    });
};
socket.on('id', function (data) {
    myId = data.id;
    registerClientActions();
    updatePlayers(data.players);
});

socket.on('drop', function (players) {
    removePlayers(players);
});

socket.on('newPlayer', function (data) {
    updatePlayers(data.players);
});

const enableButton = function (id) {
    $(id).removeAttr('disabled');
};
socket.on('turn', function (data) {
    enableButton(`#player${myId}hit`);
    enableButton(`#player${myId}stand`);
});

const disableButton = function (id) {
    $(id).attr('disabled', 'disabled');
};
const start = function () {
    disableButton(`#player${myId}start`);
    socket.emit('start');
};

const hit = function () {
    disableButton(`#player${myId}hit`);
    disableButton(`#player${myId}stand`);
    socket.emit('hit');
};

const stand = function () {
    disableButton(`#player${myId}hit`);
    disableButton(`#player${myId}stand`);
    socket.emit('stand');
};

const getSuit = function (suit) {
    if (suit === 'H') {
        return 'hearts'
    } else if (suit === 'S') {
        return 'spades';
    } else if (suit === 'D') {
        return 'diamonds'
    } else if (suit === 'C') {
        return 'clubs'
    }

    return suit;
};

const getRank = function (rank) {
    if (rank === 1) {
        return 'ace';
    } else if (rank === 11) {
        return 'jack';
    } else if (rank === 12) {
        return 'queen';
    } else if (rank === 13) {
        return 'king';
    }
    return rank;
};

const getCardImg = function (card) {
    const image = new Image();
    image.src = '../img/' + getRank(card.rank) + "_of_" + getSuit(card.suit) + '.svg?d=' + Date.now();
    return image;
};


const updateResult = function (result) {
    if(result) {
        let won = result.won;
        let player = result.player;

        let playerDiv = $(`#player${player.id}`);
        switch(won) {
            case true:
                $('#result').text(player.name + " WIN's");
            case false:
                $('#result').text(player.name + " BUSTED");
                //disable the player div
                playerDiv.remove();
                //show notification
                $('.alert').show();
                window.setTimeout(function() {
                    $(".alert").fadeTo(500, 0).slideUp(500, function(){
                        $(this).remove();
                    });
                }, 4000);
                break;
        }
    }
};

const enableDealIfGameFinished = function (result) {
    if (!result) {
        enableButton(`#player${myId}start`);
    }
};
