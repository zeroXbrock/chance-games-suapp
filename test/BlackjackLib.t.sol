// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.16;

import {Test} from "forge-std/Test.sol";
import {SuaveEnabled} from "suave-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {Cards} from "../src/libraries/BlackjackLib.sol";

contract SlotLibV2Test is Test, SuaveEnabled {
    using Cards for Cards.Card;
    function testSortedDeck() public {
        Cards.Card[52] memory deck = Cards.sorted_deck();
        for (uint32 i = 0; i < 52; i++) {
            console2.logString(deck[i].to_card_string());
        }
        assert(deck[0].number == 0);
        assert(deck[13].number == 0);
        assert(deck[0].suit == 0);
        assert(deck[13].suit == 1);
        assert(deck[51].number == 12);
        assert(deck[51].suit == 3);
    }
}
