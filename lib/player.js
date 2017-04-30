var hand = require('./hand');

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.hand = hand.newHand();
    this.role = '';
    this.score = 0;
}

Player.prototype.toJson = function () {
    return {
        name: this.name,
        cards: this.hand ? this.hand.toJson(): {},
        role: this.role,
        score: this.getScore()
    }
};

Player.prototype.getScore = function () {
    return this.hand.getScore();
};

Player.prototype.addCard = function (nextCard) {
    this.hand.addCard(nextCard);
};

Player.prototype.isBusted = function () {
    return this.hand.isBust();
};

exports.newPlayer = function (id, name) {
    return new Player(id, name);
};