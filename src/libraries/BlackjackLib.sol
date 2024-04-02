pragma solidity ^0.8.19;

import {Random} from "suave-std/Random.sol";

library Cards {
    uint8 constant NUM_SUITS = 4;
    uint8 constant MAX_CARD_NUM = 13;

    struct Card {
        uint8 suit; // 0 - 3
        // 0 = Club
        // 1 = Diamond
        // 2 = Heart
        // 3 = Spade
        uint8 number; // 0 - 12
        // 0 = A
        // 1 = 2
        // ...
        // 10 = J
        // 11 = Q
        // 12 = K
    }

    function shuffle(Card[MAX_CARD_NUM * NUM_SUITS] memory deck) internal
    returns (Card[MAX_CARD_NUM * NUM_SUITS] memory) {
        for (uint i = 0; i < NUM_SUITS; i++) {
            for (uint j = 0; j < MAX_CARD_NUM; j++) {
                // pick a random index and swap this card with it
                uint randomIdx = Random.randomUint16() % (NUM_SUITS * MAX_CARD_NUM);
                uint256 idx = i * MAX_CARD_NUM + j;
                Card memory temp = deck[idx];
                deck[idx] = deck[randomIdx];
                deck[randomIdx] = temp;
            }
        }
        return deck;
    }

    function to_card_string(Card memory card) internal pure returns (string memory) {
        string[NUM_SUITS] memory suitNames = ["Clubs", "Diamonds", "Hearts", "Spades"];
        string[MAX_CARD_NUM] memory cardNumbers = [
            "Ace",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Jack",
            "Queen",
            "King"
        ];
        return string(abi.encodePacked(cardNumbers[card.number], " of ", suitNames[card.suit]));
    }

    function sorted_deck() public pure returns (Card[52] memory deck) {
        for (uint8 i = 0; i < NUM_SUITS; i++) {
            for (uint8 j = 0; j < MAX_CARD_NUM; j++) {
                deck[((i * MAX_CARD_NUM) + j)] = Card({
                    suit: i,
                    number: j
                });
            }
        }
    }
}
