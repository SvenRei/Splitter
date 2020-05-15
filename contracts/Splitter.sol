pragma solidity ^0.5.8;

//for pausing
import "./Killed.sol";
//for the correct math with ether/wei
import "./Safemath.sol";


contract Splitter is Killed{
    //using the library
    using SafeMath for uint;
   // using safemath for uint;

    //saving the addresses into a mapping
    mapping(address => uint) public balances;

    // Log who is sending, who are the recipients, which amount will be splittet
    event LogSplit(
        address indexed from,
        address indexed one,
        address indexed two,
        uint sendAmount
        );
    //record who is withdrawing ether/wei
    event LogWithdraw(
        address indexed from,
        uint amount
        );

    //setting the function which splits the ether
    //if there are any remainders they're going back to the sender
    function split(address one, address two) public payable whenRunning {
        require(one != address(0x0) && two != address(0x0), "the addresses can't be 0x0"); //Fake addresses are not allowed
        require(one != two, "the recpipients can't be the same"); //some guy could go in with the same address
        require(msg.sender != one && msg.sender != two, "the sender can't be a recipient"); //ALice isn't allowed to get money
        //the value must be bigger than zero
        require(msg.value >= 2, "At least two Wei should be splittet");

        //division with safemath
        uint half = msg.value.div(2);
        uint remainder = msg.value.mod(2);

        if(remainder != 0){
          balances[msg.sender] = balances[msg.sender].add(remainder);
        }

        //using in event for logging all participants
        emit LogSplit(msg.sender, one, two, msg.value);
        //Putting in safemath
        balances[one] = balances[one].add(half);
        balances[two] = balances[two].add(half);

    }
    //Let the user withdraw their ether
    function withdraw(uint amount) public whenRunning returns(bool done){
        require(amount > 0, "A higher balance than zero, is a prerequisite");
        require(amount <= balances[msg.sender], "amount > balance[msg.sender]");
        //the balance set to 0 because when calling again the balance would be bigger
        balances[msg.sender] = balances[msg.sender] - amount;
        //logging the Withdraw
        emit LogWithdraw(msg.sender, amount);
        //transferring the money to the accounts
        msg.sender.transfer(amount);
        return true;
    }
}
