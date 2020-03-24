const splitter = artifacts.require("splitter.sol");

contract('splitter', (accounts) => {

  //console.log(web3.currentProvider)

  it("there should be 3 accounts, the first one needs 3 Ether", async() => {
    const splitterinstance = await splitter.deployed();

    //Setup 3 account
    const account_sender = accounts[0];
    const account_one = accounts[1];
    const account_two = accounts[2];

    const balanceaccount_sender = (await splitterinstance.getBalance.call(account_sender)).toNumber();
    assert.isAbove(balanceaccount_sender, 2, 'the test works');
  });


});
