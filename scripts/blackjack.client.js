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

var getSuitHtml = function (suit) {
    var image = 'club.png';
    if (suit === 'H') {
        image = 'heart.png';
    } else if (suit === 'S') {
        image = 'spade.png';
    } else if (suit === 'D') {
        image = 'diamond.png';
    }
    return "<img class='card' src='img/" + image + "'/>";
};

var getRankHtml = function (rank) {
    if (rank === 1) {
        return 'A';
    } else if (rank === 11) {
        return 'J';
    } else if (rank === 12) {
        return 'Q';
    } else if (rank === 13) {
        return 'K';
    }
    return rank;
};

var getCardsHtml = function (cards) {
    var html = '';
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        html += getRankHtml(card.rank);
        html += getSuitHtml(card.suit);
    }
    return html;
};

var updatePlayer = function (player) {
    var html = getCardsHtml(player.cards);
    $('#playerCards').html(html);
    $('#playerScore').text(player.score);
};

var updateDealer = function (dealer) {
    var html = getCardsHtml(dealer.cards);
    $('#dealerCards').html(html);
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