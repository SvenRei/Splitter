pragma solidity ^0.5.8;

import "./owned.sol";

contract Paused is Owned{

     bool private paused;

    event LogPausedContract(address sender);
    event LogResumedContract(address sender);

    modifier whenRunning{
        require(paused == false, "the contract is whenPaused");
        _;
    }

    modifier whenPaused{
        require(paused != false, "the contract is whenRunning");
        _;
    }

    function IsPaused() public view returns(bool _paused) {
        return paused;
    }

    function pause() public onlyOwner whenRunning{
        paused = true;
        emit LogPausedContract(msg.sender);
    }

    function resume() public onlyOwner whenPaused{
        paused = false;
        emit LogResumedContract(msg.sender);
    }
}
