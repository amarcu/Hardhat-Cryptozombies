require("@nomiclabs/hardhat-waffle");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.19",
      },
      {
        version: "0.4.18",
        settings: {},
      },
      {
        version: "0.4.22",
        settings: {},
      }
    ],
  },
};
