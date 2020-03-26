const Splitter = artifacts.require("Splitter.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

// build up a new Splitter contract before each test

contract('Splitter', (accounts) => {

  //Activate when uncertain in which network you are
  //console.log(web3.currentProvider)

  //setting up the instance
  let contractInstance;
  //Setup 3 account
  const account_sender = accounts[0];
  const account_one = accounts[1];
  const account_two = accounts[2];

  //Set up a new contract before each test
  beforeEach("set up conract", async () => {
    //account_sender deploys the contract
    contractInstance =  await Splitter.new({from: account_sender});
  });

  //test if the contract can be paused
  it("the contract should be paused, if the function is called", async() => {
    //call pause from account_sender
    const logPause = await contractInstance.pause({ from: account_sender });
    truffleAssert.eventEmitted(logPause, "LogPausedContract");
    //plotting
    //truffleAssert.prettyPrintEmittedEvents(logPause)

    //or the short way..
    //assert.strictEqual(await contractInstance.IsPaused() , true, "the contract isn't paused");
  });

  //test if the contract can be paused by accounts != owner
  it("pausing from another account than account_sender isn't allowed", async() => {
      await truffleAssert.reverts(
        contractInstance.pause({from: account_one}),
        "The sender must be the owner"
    );
  });

  //test if the splitter contract starts with IsPausd == false
  it("IsPaused should be startet false", async() => {
      assert.strictEqual(await contractInstance.IsPaused(), false, "IsPaused==true");
  }),

  //test if the contract can be resumed
  it("the contract should be resumed, if the function is called", async() => {
    await contractInstance.pause({ from: account_sender });
    await contractInstance.resume({ from: account_sender});
      assert.strictEqual(await contractInstance.IsPaused() , false , "the contract is paused");
  });

  //test if the contract can be resumed by a account != owner
  it("resume from another account than account_sender isn't allowed", async() => {
      await contractInstance.pause({ from: account_sender});
      await truffleAssert.reverts(
        contractInstance.resume({from: account_one}),
        "The sender must be the owner"
    );
  });

  //test the LogSplit event
  it("Emit the LogSplit-event", async() => {
    //setting the amount
    const amount = web3.utils.toWei("1", "Gwei");
    //call the contract from amount_sender
    const split = await contractInstance.split(account_one, account_two, {from: account_sender, value: amount})
    //check if the event emitted
    truffleAssert.eventEmitted(split, "LogSplit");
    //plotting
    //truffleAssert.prettyPrintEmittedEvents(split);
   });


   it("Emit the LogWithdraw-event", async() => {
     //setting the amount
     const amount = web3.utils.toWei("1", "Gwei");
     //because of beforeEach the contract must be called again
     await contractInstance.split(account_one, account_two, {from: account_sender, value: amount})
     //call the contract from account_one
     const withdraw = await contractInstance.withdraw({from: account_one});
     //check if the event emitted
     truffleAssert.eventEmitted(withdraw, "LogWithdraw");
     //plotting
     //truffleAssert.prettyPrintEmittedEvents(withdraw);
    });


  //check the balance after withdraw for account_one
  it("balance after withdraw = balance before withdraw + amount withdrawn - withdraw function tx fee", async() => {
    //setting the amount
    const amount = web3.utils.toWei("1", "Gwei");

    //getting the balance before withdraw
    const balanceBefore = await web3.eth.getBalance(account_one);
    //because of beforeEach the contract must be called again
    await contractInstance.split(account_one, account_two, {from: account_sender, value: amount})

    //calling withdraw from account_one
    const txObj = await contractInstance.withdraw({from: account_one});
    //getting the transaction for calculating gasCost
    const tx = await web3.eth.getTransaction(txObj.tx);
    //getting the receipt for calculating gasCost
    const receipt = txObj.receipt;
    //calculating gasCost
    const gasCost = (tx.gasPrice)*(receipt.gasUsed);


    //calculating expectetbalanceafter
    const expectedBalanceAfter = web3.utils.toBN(balanceBefore).add(web3.utils.toBN(web3.utils.toWei("0.5", "Gwei"))).sub(web3.utils.toBN(gasCost));

    //getting the balance after withdraw
    const balanceAfter = await web3.eth.getBalance(account_one);
    //test if expectedBalanceAfter == balanceAfter
    assert.strictEqual(expectedBalanceAfter.toString(), balanceAfter.toString(), "Balance of account_one isn't right");
  });

});
