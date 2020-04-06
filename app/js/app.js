const Web3 = require("web3");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json")


if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

//accounts
let sender = {address: {key: "#senderAddress", val: "0x"}, balance: {key: "#senderBalance", val: 0}};
let one = {address: {key: "#oneAddress", val: "0x"}, balance: {key: "#oneBalance", val: 0}};
let two = {address: {key: "#twoAddress", val: "0x"}, balance: {key: "#twoBalance", val: 0}};

//add listener
window.addEventListener('load', function() {
  return web3.eth.getAccounts()
        .then(accounts => {
          //must be sender, one, two or more
          if (accounts.length < 2) {
             for (const acc of [sender, one, two]) {
                 $(acc.address.key).html("N/A");
                 $(acc.balance.key).html("N/A");
             }
            //error handling
             throw new Error("No required accounts present");
          }
          //setting acc
          sender.address.val = accounts[0];
          one.address.val = accounts[1];
          two.address.val = accounts[2];
          return Splitter.deployed();
        })
        //show balances at the beginning
        .then(deployed => {
          //refresh the balances
          refreshAllBalances([sender, one, two]);
          //set the buttons
          $("#split").click(split);
          $("#refresh").click(refresh);
      })

       .catch(error => {
           $("#status").html(error.toString());
           console.error(error);
    });
  });
  //refresh the balances (refreshing the balances of one and two after split is buggy..)
  //refresh all! balances
  function refreshAllBalances(accounts) {
      //status
      $("#status").html("Refreshing balances...");
      //helper
      let counter = 0;
      //get the length of the array
      const accNumber = accounts.length;
      //log
      console.log("length" + accounts.length);
      //set the function for calling
      function refreshBalance(account) {
          //get the balance!
          function getBalance(account) {
              //return the balance
              return web3.eth.getBalance(account.address.val)
              //update the balance
              .then(bal => {
                  //saving the balance
                  account.balance.val = bal;
                  //log the balance
                  console.log("Balance of acc" + "\t" + counter + "\t" + bal);
                  //update
                  $(account.balance.key).html(account.balance.val);
                  //helper ++
                  counter++;
                  //console.log("counter" + counter);
                  if (counter == accNumber) {

                      $("#status").html("Balances refreshed");
                  }
              })
              //error handling
              .catch(error => {
                  $("#status").html(error.toString());
                  console.error(error);
              });
          }
          //update
          $(account.address.key).html(account.address.val);
          //call function getBalance
          getBalance(account);

      };
      //iterating
      for (const acc of accounts) {
          refreshBalance(acc);
          //logging
          console.log("this is the account___:" + acc.balance.key );
      }
  }

//set up split function
const split = function() {
  //declaring local
  let deployed;
  //gas
  const gas = 300000;
  //amount from the input
  const amount = $("input[name='amount']").val();
  //log
  console.log(amount);
  //get into splitter
  return Splitter.deployed()
      .then(_deployed => {
          deployed = _deployed;

          /// We simulate the real call and see whether this is likely to work.
          // No point in wasting gas if we have a likely failure.
          return deployed.split.call(one.address.val, two.address.val,
              { from: sender.address.val, value: amount, gas: gas });
      })
      .then(success => {
          if (!success) {
              throw new Error("The transaction will fail anyway, not sending");
          }
          //  proper transaction.
          return deployed.split(one.address.val, two.address.val,
              { from: sender.address.val, value: amount, gas: gas })
              .on(
                  "transactionHash",
                  txHash => $("#status").html("Transaction on the way " + txHash)
              );
      })//for browser console..
      .then(txObj => {
                 const receipt = txObj.receipt;
                 console.log("got receipt", receipt);
                 if (!receipt.status) {
                     console.error("Wrong status");
                     console.error(receipt);
                     $("#status").html("There was an error in the tx execution, status not 1");
                 } else if (receipt.logs.length == 0) {
                     console.error("Empty logs");
                     console.error(receipt);
                     $("#status").html("There was an error in the tx execution, missing expected event");
                 } else {
                     console.log(receipt.logs[0]);
                     $("#status").html("Transfer executed");
                 }
             })
      //error handling
      .catch(error => {
          $("#status").html(error.toString());
          console.error(error);
      });
};
//for calling.. which is not working..^^
const refresh = function() {
    refreshAllBalances([sender, one, two]);
};

require("file-loader?name=../index.html!../index.html");
