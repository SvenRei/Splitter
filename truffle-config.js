
module.exports = {
  networks: {
    development: { // This one is optional and reduces the scope for failing fast
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      //gas: 500000
    },
ropsten: {
      host: "127.0.0.1",
      port: 8545,
      network_id: 3
    }
  }
};
