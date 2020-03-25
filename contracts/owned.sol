pragma solidity ^0.5.8;

contract Owned{

    address private owner;

    event LogChangeOwner(address indexed sender, address newOwner);

    constructor() public {
      owner = msg.sender;
    }

     modifier onlyOwner {
        require(msg.sender == owner,"The sender must be the owner");
        _;
    }


    function changeOwner(address newOwner) public onlyOwner returns(bool success){
        require(newOwner!=address(0x0), "The address of the new owner should not be empty");
        owner = newOwner;
        emit LogChangeOwner(msg.sender, newOwner);
        return true;
    }

}
