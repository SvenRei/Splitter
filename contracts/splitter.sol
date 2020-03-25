pragma solidity ^0.5.8;

//for pausing
import "./paused.sol";
//for the correct math with ether/wei
import "./safemath.sol";


contract Splitter is Paused{
    //using the library
    using SafeMath for uint;
   // using safemath for uint;

    //saving the addresses into a mapping
    mapping(address => uint) public balances;

    // Log who is sending, who are the recipients, which amount will be splittet
    event LogSplit(
        address indexed from,
        address indexed _one,
        address indexed _two,
        uint value
        );
    //record who is withdrawing ether/wei
    event LogWithdraw(
        address indexed from,
        uint value2
        );

    //setting the function which splits the ether
    //if there are any remainders they're going back to the sender
    function split(address _one, address _two) public payable whenRunning {
        require(_one != _two, "the recpipients can't be the same"); //some guy could go in with the same address
        require(msg.sender != _one && msg.sender != _two, "the sender can't be a recipient"); //ALice isn't allowed to get money
        require(_one != address(0x0) && _two != address(0x0), "the addresses can't be 0x0"); //Fake addresses are not allowed
        //defining balance as the value sended by the messenger

        //the value must be bigger than zero
        require(msg.value > 0, "zero can't be splitted");

        //division with safemath
        uint tvalue = msg.value.div(2);
        uint remaindervalue = msg.value.mod(2);

        if(remaindervalue > 2){
            balances[msg.sender] = balances[msg.sender].add(remaindervalue);
        }
        //using in event for logging all participants
        emit LogSplit(msg.sender, _one, _two, tvalue);
        //Putting in safemath
        balances[_one] = balances[_one].add(tvalue);
        balances[_two] = balances[_two].add(tvalue);

    }
    //Let the user withdraw their ether
    function withdraw() public whenRunning returns(bool done){
        //saving a local variable
        uint amount = balances[msg.sender];
        //it must be bigger than zero
        require(amount > 0, "A higher balance than zero, is a prerequisite");
        //the balance set to 0 because when calling again the balance would be bigger
        balances[msg.sender] = 0;
        //logging the Withdraw
        emit LogWithdraw(msg.sender, amount);
        //transferring the money to the accounts
        msg.sender.transfer(amount);
        return true;
    }

}
