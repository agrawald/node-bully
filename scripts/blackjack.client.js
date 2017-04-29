var socket = io();

socket.on('stand', function (game) {
    standResult(game);
});
socket.on('deal', function (game) {
    dealResult(game);
});
socket.on('hit', function (game) {
    hitResult(game);
});

var deal = function () {
    socket.emit('deal');
};

var hit = function () {
    socket.emit('hit');
};

var stand = function () {
    socket.emit('stand');
};

var getSuit = function (suit) {
    if (suit === 'H') {
        return 'hearts'
    } else if (suit === 'S') {
        return 'spades';
    } else if (suit === 'D') {
        return 'diamonds'
    }

    return 'clubs';
};

var getRank = function (rank) {
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

var getCardImg = function (card) {
    var image = new Image();
    image.src = '../img/' + getRank(card.rank) + "_of_" + getSuit(card.suit) + '.svg?d=' + Date.now();
    return image;
};

var updatePlayer = function (player) {
    loadCardImages($('#playerCards')[0], player.cards, drawCards);
    $('#playerScore').text(player.score);
};

var loadCardImages = function (player, cards, callback) {
    var loaded = 0;
    var images = [];
    for (var i = 0; i < cards.length; i++) {
        images[i] = getCardImg(cards[i]);
        images[i].onload = function () {
            if (++loaded === cards.length && callback) {
                callback(player, images);
            }
        };
    }
};

var drawCards = function (player, images) {
    var ctx = player.getContext('2d');
    ctx.clearRect(0, 0, 500, 150);
    for (var i = 0; i < images.length; i++) {
        ctx.drawImage(images[i], i * 20, 0, 100, 150);
    }
};

var updateDealer = function (dealer) {
    loadCardImages($('#dealerCards')[0], dealer.cards, drawCards);
    $('#dealerScore').text(dealer.score);
};

var updateResult = function (result) {
    var displayResult = result;
    if (result === 'None') {
        displayResult = '';
    }
    $('#result').text(displayResult);
};

var disableButton = function (id) {
    $(id).attr('disabled', 'disabled');
};

var enableButton = function (id) {
    $(id).removeAttr('disabled');
};

var disableDeal = function () {
    disableButton('#deal');
    enableButton('#hit');
    enableButton('#stand');
};

var enableDeal = function () {
    enableButton('#deal');
    disableButton('#hit');
    disableButton('#stand');
};

var enableDealIfGameFinished = function (result) {
    if (result !== 'None') {
        enableDeal();
    }
};

var dealResult = function (game) {
    disableDeal();
    updateDealer(game.dealer);
    updatePlayer(game.player);
    updateResult(game.result);
};

var hitResult = function (game) {
    updateDealer(game.dealer);
    updatePlayer(game.player);
    updateResult(game.result);
    enableDealIfGameFinished(game.result);
};

var standResult = function (game) {
    updateDealer(game.dealer);
    updatePlayer(game.player);
    updateResult(game.result);
    enableDealIfGameFinished(game.result);
};

var registerClientActions = function () {

    $('#deal').click(function () {
        deal();
    });

    $('#hit').click(function () {
        hit();
    });

    $('#stand').click(function () {
        stand();
    });
};

var init = function () {
    registerClientActions();
    enableDeal();
};

$(document).ready(function () {
    init();
});