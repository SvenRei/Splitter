const Splitter = artifacts.require("Splitter.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

// build up a new Splitter contract before each test

contract('Splitter', (accounts) => {

  //Activate when uncertain in which network you are
  //console.log(web3.currentProvider)

  //setting up the instance
  let contractInstance;

  //setting up three accounts
  const [sender, one, two] = accounts;

  //Set up a new contract before each test
  beforeEach("set up conract", async () => {
    //sender deploys the contract
    contractInstance =  await Splitter.new({from: sender});
  });

  //test if the contract can be paused
  it("test: pause of the contract", async() => {
    //call pause from sender
    const pauseObj = await contractInstance.pause({ from: sender });
    const { logs } = pauseObj;
    const checkEvent = pauseObj.logs[0];
    truffleAssert.eventEmitted(pauseObj, "LogPausedContract");
    assert.strictEqual(checkEvent.args.sender, sender);

    //plotting
    //truffleAssert.prettyPrintEmittedEvents(logPause )
    // or:
    // console.log(JSON.stringify(split, null, 4));
  });

  //test if the contract can be paused by accounts != owner
  it("test: pausing from another account than sender isn't allowed", async() => {
      await truffleAssert.reverts(
        contractInstance.pause({from: one}),
        "The sender must be the owner"
    );
  });

  //test if the splitter contract starts with IsPausd == false
  it("test: the splitter shoud start istPaused = false", async() => {
      assert.isFalse(await contractInstance.isPaused(),
    );
  }),

  //test if the contract can be resumed by a account != owner
  it("test: resume from another account than sender isn't allowed", async() => {
      await contractInstance.pause({ from: sender});
      await truffleAssert.reverts(
        contractInstance.resume({from: one}),
        "The sender must be the owner"
    );
  });

  //test the LogSplit event
  it("test: LogSplit-event should be emitted", async() => {
    //setting the amount
    const amount = web3.utils.toWei("1", "Gwei");
    //call the contract from sender
    const splitObj = await contractInstance.split(one, two, {from: sender, value: amount});
    const { logs } = splitObj;
    const checkEvent = splitObj.logs[0];
    truffleAssert.eventEmitted(splitObj, "LogSplit");
    assert.strictEqual(checkEvent.args.from, sender);
    assert.strictEqual(checkEvent.args.one, one);
    assert.strictEqual(checkEvent.args.two, two);
    assert.strictEqual(checkEvent.args.sendAmount.toString(), amount.toString());
    //assert.strictEqual(checkEvent.args.splittetValue.toString(), web3.utils.toWei("0.5", "Gwei").toString());

    //plotting
    //truffleAssert.prettyPrintEmittedEvents(split);
    //console.log(JSON.stringify(split, null, 4));
   });

   it("test: LogWithdrew-event should be emitted", async() => {
     //setting the amount
     const amount = web3.utils.toWei("1", "Gwei");
     //because of beforeEach the contract must be called again
     await contractInstance.split(one, two, {from: sender, value: amount});
     //call the contract from one
     const withdrawObj = await contractInstance.withdraw({from: one});
     //logging
     const { logs } = withdrawObj
     //setting for check
     const checkEvent = withdrawObj.logs[0];
     //check if the event emitted
     truffleAssert.eventEmitted(withdrawObj, "LogWithdrew");
     assert.strictEqual(checkEvent.args.from, one);
     assert.strictEqual(checkEvent.args.remainder.toString(), web3.utils.toWei("0.5", "Gwei").toString());
    });

  //check for confirming the right balanaces
  it("test: the right state balances should be splittet", async() => {
    //setting the amount
    const amount = web3.utils.toWei("1", "Gwei");
    await contractInstance.split(one, two, {from: sender, value: amount});
    //getting the balance after split (new function in Splitter.sol)
    const balanceAfterOne = await (contractInstance.getBalance(one));
    const balanceAfterTwo = await (contractInstance.getBalance(two));
    //test
    assert.strictEqual(balanceAfterOne.toString(), web3.utils.toWei("0.5", "Gwei").toString(), "Balance of one isn't right");
    assert.strictEqual(balanceAfterTwo.toString(), web3.utils.toWei("0.5", "Gwei").toString(), "Balance of two isn't right");
  });

  it("test: the right state balances should be splittet, even if the input is uneven", async() => {
    //setting the uneven amount (prime number for generating remainders)
    await contractInstance.split(one, two, {from: sender, value: amount = 23});
    //getting the balance after split (new function in Splitter.sol)
    const balanceAfterSender = await (contractInstance.getBalance(sender));
    const balanceAfterOne = await (contractInstance.getBalance(one));
    const balanceAfterTwo = await (contractInstance.getBalance(two));
    //test
    assert.strictEqual(balanceAfterOne.toString(), "11", "Balance of one isn't right");
    assert.strictEqual(balanceAfterTwo.toString(), "11", "Balance of two isn't right");
    assert.strictEqual(balanceAfterSender.toString(), "1", "Balance of sender isn't right");
  });

  //Check if the balance of account one increases after each contract calling
  it("test: the balanace of account one should not reset while calling split twice", async() => {
    //setting the amounts
    const amount1 = web3.utils.toWei("3", "Gwei");
    const amount2 = web3.utils.toWei("4", "Gwei");
    //because of beforeEach the contract must be called again
    await contractInstance.split(one, two, {from: sender, value: amount1});
    await contractInstance.split(one, two, {from: sender, value: amount2});
    //getting the internal balance
    const balanceAfterOne = await (contractInstance.getBalance(one));
    //test balanceAfterOne
    assert.strictEqual(web3.utils.toWei("3.5", "Gwei").toString(), balanceAfterOne.toString(), "Balance of one isn't right");
  });

  //check the balance after withdraw for one
  it("test: balance after withdraw = balance before withdraw + amount withdrawn - withdraw function tx fee", async() => {
    //setting the amount
    const amount = web3.utils.toWei("1", "Gwei");
    //because of beforeEach the contract must be called again
    await contractInstance.split(one, two, {from: sender, value: amount});
    //getting the balance before withdraw
    const balanceBefore = await web3.eth.getBalance(one);
    //calling withdraw from one
    const txObj = await contractInstance.withdraw({from: one});
    //getting the transaction for calculating gasCost
    const tx = await web3.eth.getTransaction(txObj.tx);
    //getting the receipt for calculating gasCost
    const receipt = txObj.receipt;
    //calculating gasCost
    const gasCost = web3.utils.toBN(tx.gasPrice).mul(web3.utils.toBN(receipt.gasUsed));
    //calculating expectetbalanceafter
    const expectedBalanceAfter = web3.utils.toBN(balanceBefore).add(web3.utils.toBN(web3.utils.toWei("0.5", "Gwei"))).sub(web3.utils.toBN(gasCost));
    //getting the balance after withdraw
    const balanceAfter = await web3.eth.getBalance(one);
    //test if expectedBalanceAfter == balanceAfter
    assert.strictEqual(expectedBalanceAfter.toString(), balanceAfter.toString(), "Balance of one isn't right");
  });

  it("test: the internal balance after withdraw should be 0", async() => {
    //setting the amount
    const amount = web3.utils.toWei("1", "Gwei");
    //because of beforeEach the contract must be called again
    await contractInstance.split(one, two, {from: sender, value: amount});
    //calling withdraw from one
    await contractInstance.withdraw({from: one});
    //getting balance after
    const balanceAfterOne = await (contractInstance.getBalance(one));
    //test
    assert.strictEqual(balanceAfterOne.toString(), "0", "The balance of account one is wrong");
    });
});
