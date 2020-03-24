pragma solidity ^0.5.8;

import "./owned.sol";

contract Paused is Owned{

     bool private paused;

    event LogPausedContract(address sender);
    event LogResumedContract(address sender);

    modifier isRunning{
        require(paused == false, "the contract is isPaused");
        _;
    }

    modifier isPaused{
        require(paused != false, "the contract is isRunning");
        _;
    }

    function checkpaused() public view returns(bool _paused) {
        return paused;
    }

    function pauseContract() public onlyOwner isRunning{
        paused = true;
        emit LogPausedContract(msg.sender);
    }

    function resume() public onlyOwner isPaused{
        paused = false;
        emit LogResumedContract(msg.sender);
    }
}
