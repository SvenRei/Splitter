pragma solidity ^0.5.8;

import "./Paused.sol";

contract Killed is Paused{

     bool private killed;

    event LogKilled(address indexed sender);
    event LogRefunds(address indexed sender, uint refunds);

    modifier whenAlive{
        require(!killed, "isKilled");
        _;
    }

    modifier whenKilled{
        require(killed, "isAlive");
        _;
    }

    function isKilled() public view returns(bool _killed) {
        return killed;
    }

    function kill() public onlyOwner whenAlive whenPaused {
        killed = true;
        emit LogKilled(msg.sender);
    }

    //https://solidity.readthedocs.io/en/v0.5.3/security-considerations.html#security-considerations
    function returnFunds() external onlyOwner whenKilled{
        require(address(this).balance != 0, "the balance of the contract can't be zero");
        emit LogRefunds(msg.sender, address(this).balance);
        msg.sender.transfer(address(this).balance);
    }
}
