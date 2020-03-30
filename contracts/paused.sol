pragma solidity ^0.5.8;

import "./Owned.sol";

contract Paused is Owned{

     bool private paused;

    event LogPausedContract(address indexed sender);
    event LogResumedContract(address indexed sender);

    modifier whenRunning{
        require(!paused, "is paused");
        _;
    }

    modifier whenPaused{
        require(paused, "is runnnig");
        _;
    }

    function isPaused() public view returns(bool _paused) {
        return paused;
    }

    function pause() public onlyOwner whenRunning {
        paused = true;
        emit LogPausedContract(msg.sender);
    }

    function resume() public onlyOwner whenPaused{
        paused = false;
        emit LogResumedContract(msg.sender);
    }
}
