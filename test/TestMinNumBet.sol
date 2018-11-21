pragma solidity ^0.4.23;

import "truffle/Assert.sol";
//import "truffle/DeployedAddresses.sol";
import "../contracts/MinNumBet.sol";

contract TestMinNumBet{
    function testNewContractMeansAllSessionsClosed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        bool expected = true;
        //act
        bool actual = betting.allSessionsClosed();
        //assert
        Assert.equal(actual, expected, "On a new contract all sessions should be closed");
    }
    function testCreateNewSessionMeansNotAllSessionsClosed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        betting.createNewSession(1);
        bool expected = false;
        //act
        bool actual = betting.allSessionsClosed();
        //assert
        Assert.equal(actual, expected, "On a new session not all sessions are closed");
    }
    function testCreateNewSessionWithZeroValue() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        //act
        bool callSuccess = address(betting).call(bytes4(keccak256("createNewSession(uint)")), 0);
        //assert
        Assert.isFalse(callSuccess, "Can't create a session where the value is zero");
    }
    function testClosingTheOneOpenSessionWithAtLeastOneBetMeansAllSessionsAreClosed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        uint newSessionId = betting.createNewSession(1);
        // Adding bet, because it's not possible to close a session without bets
        betting.placeBet(newSessionId, 5);
        betting.closeSession(newSessionId);
        bool expected = true;
        //act
        bool actual = betting.allSessionsClosed();
        //assert
        Assert.equal(actual, expected, "When closing the one and only session, all sessions are closed");
    }
    function testClosingTheOneOpenSessionWithNoBetsIsNotAllowed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        uint newSessionId = betting.createNewSession(1);
        //act
        bool callSuccess = address(betting).call(bytes4(keccak256("closeSession(uint)")), newSessionId);
        //assert
        Assert.isFalse(callSuccess, "Can't close a session where there are no bets");
    }
    function testClosingAClosedSessionIsNotAllowed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        uint newSessionId = betting.createNewSession(1);
        // Adding bet, because it's not possible to close a session without bets
        betting.placeBet(newSessionId, 5);
        // Close the session and try to close it again
        betting.closeSession(newSessionId);
        //act
        bool callSuccess = address(betting).call(bytes4(keccak256("closeSession(uint256)")), newSessionId);
        //assert
        Assert.isFalse(callSuccess, "Should not be possible to close a closed session.");
    }

    function testPlayerPlacesTwoBetsOnSameSessionNotAllowed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        uint newSessionId = betting.createNewSession(1);
        betting.placeBet(newSessionId, 5);
        //act
        bool callSuccess = address(betting).call(bytes4(keccak256("placeBet(uint256,uint256)")), newSessionId,6,1 ether);
        //assert
        Assert.isFalse(callSuccess, "Placing two bets on the same session is not allowed");
    }

    function testPlayerPlacesBetOnClosedSessionNotAllowed() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        uint newSessionId = betting.createNewSession(1);
        betting.placeBet(newSessionId, 5);
        betting.closeSession(newSessionId);
        //act
        bool callSuccess = address(betting).call(bytes4(keccak256("placeBet(uint256,uint256)")), newSessionId,6,1 ether);
        //assert
        Assert.isFalse(callSuccess, "Placing bet on closed session is not allowed");
    }

    function testWinnerIsTheCorrectAddressWhenOneBet() public {
        //arrange
        MinNumBet betting = new MinNumBet();
        uint newSessionId = betting.createNewSession(1);
        betting.placeBet(newSessionId, 5);
        betting.closeSession(newSessionId);
        //act
        address actual = betting.getWinner(newSessionId);
        //assert
        Assert.equal(actual, address(this), "When there is only one bet, the winner is the original sender");
    }
}