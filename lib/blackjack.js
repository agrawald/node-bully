var cards = require('./cards');
var player = require('./player')

// Blackjack game.
function BlackjackGame () {
    this.players = [];
    this.dealer = null;
    // this.dealerHand = new BlackjackHand("dealer");
    // this.playerHand = new BlackjackHand("guest");
    this.result = 'None';
    this.cards = cards.createPlayingCards();
}

BlackjackGame.prototype.newPlayer = function(playerId) {
    this.players.push(player.newPlayer(playerId, "Player " + playerId))
};

BlackjackGame.prototype.removePlayer = function(playerId) {
    delete this.players[playerId];
};

BlackjackGame.prototype.start = function() {
    for(var i=0; i< this.players.length; i++) {
        var player = this.players[i];
        if(i===0) {
            player.role = 'dealer';
            player.addCard(this.cards.dealNextCard());
            this.dealer = player;
        } else {
            player.role = 'player';
            player.addCard(this.cards.dealNextCard());
            player.addCard(this.cards.dealNextCard());
        }
    }
};

BlackjackGame.prototype.isInProgress = function () {
    return (!this.result && this.dealer.hasCards());
};

BlackjackGame.prototype.playersJson = function () {
    var json = [];
    if(this.players) {
        for(var i=0; i<this.players.length; i++) {
            json.push(this.players[i] ? this.players[i].toJson(): '');
        }
    }
    return json;
};

BlackjackGame.prototype.toJson = function () {
    return {
        dealer: this.dealer ? this.dealer.toJson() : '',
        players: this.playersJson(),
        result: this.result
    };
};


BlackjackGame.prototype.hit = function (playerId) {
    if (this.isInProgress()) {
        this.players[playerId].addCard(this.cards.dealNextCard());
        this.result = this.getResult(playerId);
    }
};

BlackjackGame.prototype.getResult = function (playerId) {
    var player = this.players[playerId];
    var playerScore = player.getScore();
    var dealerScore = this.dealer.getScore();

    if (player.isBusted()) {
        return false;
    } else if (this.dealer.isBusted()) {
        return true;
    }

    if (playerScore > dealerScore) {
        return true;
    } else if (playerScore === dealerScore) {
        return null;
    }
    return false;
};

BlackjackGame.prototype.stand = function () {
    if (this.isInProgress()) {
        while (this.dealer.getScore() < 17) {
            this.dealer.addCard(this.cards.dealNextCard());
        }
        this.result = this.getResult();
    }
};

exports.newGame = function() {
    return new BlackjackGame();
};