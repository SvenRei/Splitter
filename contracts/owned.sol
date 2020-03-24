pragma solidity ^0.5.8;

contract Owned{

     address public owner;

     event LogChangeOwner(address indexed sender, address newOwner);

     modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function Owened() public {
        owner = msg.sender;
    }

    function changeOwner(address newOwner) public onlyOwner returns(bool success){
        owner = newOwner;
        emit LogChangeOwner(msg.sender, newOwner);
        return true;
    }

}
