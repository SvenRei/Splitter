//I think i got some issues with the compiler version..
pragma solidity ^0.5.8;

//for the correct math with ether/wei
//got the safemath library from openzeppelin-contracts : https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol
//import "./safemath.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
//for pausing
import "./paused.sol";

contract Splitter is Paused{
    //using the library
    using SafeMath for uint;
   // using safemath for uint;

    //saving the addresses into a mapping
    mapping(address => uint) public balance;

    //setting up the right addresses on this contract
    modifier CorrectRecipients(address _one, address _two){
        require(_one != _two, "the recpipients can't be the same"); //some guy could go in with the same address
        require(msg.sender != _one && msg.sender != _two, "the sender can't be a recipient"); //ALice isn't allowed to get money
        require(_one != address(0x0) && _two != address(0x0), "the addresses can't be 0x0"); //Fake addresses are not allowed
        _;
    }

    //just an event for showing the right value splittet
    event rightValue(
        uint value1
        );

    // Log who is sending, who are the recipients, which amount will be splittet
    event Balancesplittet(
        address indexed from,
        address indexed _one,
        address indexed _two,
        uint value
        );
    //record who is withdrawing ether/wei
    event WithdrawLog(
        address indexed from,
        uint value2
        );

    //setting the function which splits the ether
    //if there are any remainders they're going back to the sender
    function split(address _one, address _two) public payable isRunning CorrectRecipients(_one, _two){
        //defining balance as the value sended by the messenger

        //the value must be bigger than zero
        require(msg.value > 0, "zero can't be splitted");

        //division with safemath
        uint tvalue = msg.value.div(2);
        uint remaindervalue = msg.value.mod(2);

        if(remaindervalue > 0){
            balance[msg.sender] = balance[msg.sender] + remaindervalue;
        }

        //logging the value
        emit rightValue(tvalue);
        //using in event for logging all participants
        emit Balancesplittet(msg.sender, _one, _two, tvalue);
        //there must be anything left on the contract..

        //adding the value to account _one and _two
        balance[_one] = balance[_one] + tvalue;
        balance[_two] = balance[_two] + tvalue;

    }
    //Let the user withdraw their ether
    function withdrawTheSplit() public isRunning returns(bool done){
        //saving a local variable
        uint withdraw = balance[msg.sender];
        //it must be bigger than zero
        require(withdraw > 0, "A higher balance than zero, is a prerequisite");
        //the balance set to 0 because when calling again the balance would be bigger
        balance[msg.sender] = 0;
        //logging the Withdraw
        emit WithdrawLog(msg.sender, withdraw);
        //transferring the money to the accounts
        msg.sender.transfer(withdraw);
        return true;
    }

}
