"use strict";

// Blackjack hand.
function BlackjackHand() {
    this.cards = [];
}

BlackjackHand.prototype.hasCards = function () {
    return this.cards.length > 0;
};

BlackjackHand.prototype.addCard = function (card) {
    this.cards.push(card);
};

BlackjackHand.prototype.numberToSuit = function (number) {
    const suits = ['C', 'D', 'H', 'S'];
    const index = Math.floor(number / 13);
    return suits[index];
};

BlackjackHand.prototype.numberToCard = function (number) {
    return {
        rank: (number % 13) + 1,
        suit: this.numberToSuit(number)
    };
};

BlackjackHand.prototype.maskCard = function () {
    return {
            rank: 'back',
            suit: 'card'
        };
};

BlackjackHand.prototype.getCards = function () {
    const convertedCards = [];
    for (let i = 0; i < this.cards.length; i++) {
        const number = this.cards[i];
        convertedCards[i] = this.numberToCard(number);
    }
    return convertedCards;
};

BlackjackHand.prototype.getCardScore = function (card) {
    if (card.rank === 1) {
        return 11;
    } else if (card.rank >= 11) {
        return 10;
    }
    return card.rank;
};

BlackjackHand.prototype.getScore = function () {
    let score = 0;
    const cards = this.getCards();
    const aces = [];

    // Sum all cards excluding aces.
    for (let i = 0; i < cards.length; ++i) {
        const card = cards[i];
        if (card.rank === 1) {
            aces.push(card);
        } else {
            score = score + this.getCardScore(card);
        }
    }

    // Add aces.
    if (aces.length > 0) {
        let acesScore = aces.length * 11;
        let acesLeft = aces.length;
        while ((acesLeft > 0) && (acesScore + score) > 21) {
            acesLeft = acesLeft - 1;
            acesScore = acesScore - 10;
        }
        score = score + acesScore;
    }

    return score;
};

BlackjackHand.prototype.isBust = function () {
    return this.getScore() > 21;
};

BlackjackHand.prototype.toJson = function (mask) {
    const json = [];
    if(this.cards && this.cards.length > 0) {
        for(let i=0; i<this.cards.length; i++) {
            if(mask) {
                json.push(this.maskCard());
            } else {
                json.push(this.numberToCard(this.cards[i]));
            }
        }
    }
    return json;
};

exports.newHand = function () {
    return new BlackjackHand();
};