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


window.addEventListener('load', function() {
  return web3.eth.getAccounts()
        .then(accounts => {
          if (accounts.length < 2) {
             for (const acc of [sender, one, two]) {
                 $(acc.address.key).html("N/A");
                 $(acc.balance.key).html("N/A");
             }

             throw new Error("No required accounts present");
          }
          sender.address.val = accounts[0];
          one.address.val = accounts[1];
          two.address.val = accounts[2];
          return Splitter.deployed();
        })
        .then(deployed => {
          refreshAllBalances([sender, one, two]);

          $("#split").click(split);
          $("#refresh").click(refresh);
      })

       .catch(error => {
           $("#status").html(error.toString());
           console.error(error);
    });
  });
  //refresh the balances (refreshing the balances of one and two after split is buggy)
  //iterating over the accounts to refresh the balance
  function refreshAllBalances(accounts) {
      $("#status").html("Refreshing balances...");

      let counter = 0;
      const accNumber = accounts.length;
      console.log("length" + accounts.length);

      function refreshBalance(account) {
          function getBalance(account) {
              return web3.eth.getBalance(account.address.val)
              .then(bal => {
                  account.balance.val = bal;
                  console.log("Balanace of acc" + bal);
                  $(account.balance.key).html(account.balance.val);

                  counter += 1;
                  //console.log("counter" + counter);
                  if (counter == accNumber) {
                      $("#status").html("Balances refreshed");
                  }
              })
              .catch(e => {
                  $("#status").html(e.toString());
                  console.error(e);
              });
          }

          $(account.address.key).html(account.address.val);
          getBalance(account);
      };

      for (const acc of accounts) {
          refreshBalance(acc);
      }
  }


const split = function() {
  let deployed;
  const gas = 300000;
  const amount = $("input[name='amount']").val();
  console.log(amount);

  return Splitter.deployed()
      .then(_deployed => {
          deployed = _deployed;

          return deployed.split.call(one.address.val, two.address.val,
              { from: sender.address.val, value: amount, gas: gas });
      })
      .then(success => {
          if (!success) {
              throw new Error("The transaction will fail anyway, not sending");
          }

          return deployed.split(one.address.val, two.address.val,
              { from: sender.address.val, value: amount, gas: gas })
              .on(
                  "transactionHash",
                  txHash => $("#status").html("Transaction on the way " + txHash)
              );
      })
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
      //.then(balance => $("#balance").html(balance.toString(10)))
      .catch(error => {
          $("#status").html(error.toString());
          console.error(error);
      });
};

const refresh = function() {
    refreshAllBalances([sender, one, two]);
};

require("file-loader?name=../index.html!../index.html");
