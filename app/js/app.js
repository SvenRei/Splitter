const Web3 = require("web3");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json");

require("file-loader?name=../index.html!../index.html");

if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

window.addEventListener('load', async function() {
    try {
        const accounts = await (
          web3.eth.getAccounts());
        if (accounts.length == 0) {
            $("senderBalance").html("N/A");
            throw new Error("No account with which to transact");
        }

        //network
        const network = await web3.eth.net.getId();
        console.log("Network:", network.toString(10));
        //deploy
        const deployed = await Splitter.deployed();
        console.log(deployed);

        //set up sender
        const sender = accounts[0];
        //log the sender
        console.log("Sender:", sender);
        let senderBalance = await deployed.balances(sender, {from: sender});
        $("#senderBalance").html(senderBalance.toString(10));
        console.log("sender:", senderBalance);

        //set up account1
        const one = accounts[1];
        //log acc one
        console.log("One:", one);
        let oneBalance = await deployed.balances(one, {from: one});
        $("#oneBalance").html(oneBalance.toString(10));

        //set up account2
        const two = accounts[2];
        //log acc two
        console.log("Two:", two);
        let twoBalance = await deployed.balances(two, {from: two});
        $("#twoBalance").html(twoBalance.toString(10));

       // We wire it when the system looks in order.
       $("#split").click(split);
       $("#withdraw").click(withdraw);


       } catch(err) {
         // Never let an error go unlogged.
         console.error(err);
  }
});

//set up split function
const split = async function() {

  //setting gas
  const gas = 300000;

  try{
    const accounts = await(
      web3.eth.getAccounts());
    if(accounts.length==0){
      $("#balance").html("N/A");
      throw new Error("no accounts");
    }
    //setting acc
    const deployed = await Splitter.deployed();
    const [sender, one, two] = accounts;

    /// We simulate the real call and see whether this is likely to work.
    // No point in wasting gas if we have a likely failure.
    const success = await deployed.split.call(
           $("input[name='recipient_one']").val(),
           $("input[name='recipient_two']").val(),
           // Giving a string is fine
           { from: sender, value: $("input[name='amount']").val(), gas: gas });
    if(!success){
      throw new Error("doens't work");
    }
    // Ok, we move onto the proper action.
        const txObj = await deployed.split(
            $("input[name='recipient_one']").val(),
            $("input[name='recipient_two']").val(),
            // Giving a string is fine
            { from: sender, value: $("input[name='amount']").val(), gas: gas })
            //split takes time in real life, so we get the txHash immediately while it
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            );
        // Now we got the mined tx.
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
        // Make sure we update the UI.
        //set up sender
        let senderBalance = await deployed.balances(sender, {from: sender});
        $("#senderBalance").html(senderBalance.toString(10));

        //set up account1
        let oneBalance = await deployed.balances(one, {from: one});
        $("#oneBalance").html(oneBalance.toString(10));

        //set up account2
        let twoBalance = await deployed.balances(two, {from: two});
        $("#twoBalance").html(twoBalance.toString(10));

       //error handling
     } catch(err) {
         $("#status").html(err.toString());
         console.error(err);
       }
   };
//set up split function
const withdraw = async function() {

 //gas
 const gas = 300000;

 try{
   const accounts = await(
     web3.eth.getAccounts());
   if(accounts.length==0){
     $("#balance").html("N/A");
     throw new Error("no accounts");
   }

   const deployed = await Splitter.deployed();
   const [sender, one, two] = accounts;

   /// We simulate the real call and see whether this is likely to work.
   // No point in wasting gas if we have a likely failure.
   const success = await deployed.withdraw.call(
          $("input[name='withdrawAmount']").val(),
          // Giving a string is fine
          { from: $("input[name='recipient']").val(), gas: gas });
   if(!success){
     throw new Error("doens't work");
   }
   // Ok, we move onto the proper action.
       const txObj = await deployed.withdraw(
             $("input[name='withdrawAmount']").val(),
           // Giving a string is fine
           { from: $("input[name='recipient']").val(),  gas: gas })
           //split takes time in real life, so we get the txHash immediately while it
           // is mined.
           .on(
               "transactionHash",
               txHash => $("#status").html("Transaction on the way " + txHash)
           );
       // Now we got the mined tx.
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
       // Make sure we update the UI.
       //set up sender
       let senderBalance = await deployed.balances(sender, {from: sender});
       $("#senderBalance").html(senderBalance.toString(10));

       //set up account1
       let oneBalance = await deployed.balances(one, {from: one});
       $("#oneBalance").html(oneBalance.toString(10));

       //set up account2
       let twoBalance = await deployed.balances(two, {from: two});
       $("#twoBalance").html(twoBalance.toString(10));

      //error handling
    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
      }
  };
