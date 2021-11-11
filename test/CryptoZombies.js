const { expect, assert } = require("chai");

const zombieNames = ["Zombie 1", "Zombie 2"];

describe("CryptoZombies contract", function () {

  let CryptoZombies;
  let contractInstance;
  let alice;
  let bob;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    CryptoZombies = await ethers.getContractFactory("CryptoZombies");
    [alice, bob, ...addrs] = await ethers.getSigners();

    contractInstance = await CryptoZombies.deploy();
    await contractInstance.deployed();
  });

  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contractInstance.owner()).to.equal(alice.address);
    });
  });

  describe("Zombie Creation", function() {
    it("should be able to create a new zombie", async function () {
        await contractInstance.connect(alice).createRandomZombie(zombieNames[0]);
        let eventFilter = contractInstance.filters.NewZombie();
        let events = await contractInstance.queryFilter(eventFilter);
        expect(events.length).to.equal(1);
        //console.log("events len " + events.length);
        //console.log("first event " + JSON.stringify(events[0]));
        expect(events[0].args[1]).to.equal(zombieNames[0]);
    });

    it("should not allow two zombies", async () => {
        await contractInstance.connect(alice).createRandomZombie(zombieNames[0]);
        let callFailed = true;
        try {
            await contractInstance.connect(alice).createRandomZombie(zombieNames[1]);
            callFailed = false;
        }
        catch (err) {
            return;
        }

        assert(callFailed, "The contract did not throw.");
    });

    describe("Zombie Single Step Transfer", function() {
        it("should transfer a zombie", async () => {
            await contractInstance.connect(alice).createRandomZombie(zombieNames[0]);
            let eventFilter = contractInstance.filters.NewZombie();
            let events = await contractInstance.queryFilter(eventFilter);
            //console.log(" 1 first event " + JSON.stringify(events[0]));
            const zombieId = events[0].args[0].toNumber();
            await contractInstance.transfer(bob.address, zombieId);
            const newOwner = await contractInstance.ownerOf(zombieId);
            assert.equal(newOwner, bob.address);
        });
    });

    describe("Zombie Two Step Transfer", function() {
        it("should approve and then transfer a zombie when the approved address calls transfer", async () => {
            await contractInstance.connect(alice).createRandomZombie(zombieNames[0]);
            let eventFilter = contractInstance.filters.NewZombie();
            let events = await contractInstance.queryFilter(eventFilter);
            const zombieId = events[0].args[0].toNumber();

            await contractInstance.connect(alice).approve(bob.address, zombieId);
            //console.log("approve " + zombieId);
            await contractInstance.connect(bob).transfer(bob.address, zombieId);
            //console.log("transfer " + zombieId);
            const newOwner = await contractInstance.ownerOf(zombieId);
            assert.equal(newOwner, bob.address);
        });

        it("should approve and then transfer a zombie when the owner address calls transfer", async () => {
            await contractInstance.connect(alice).createRandomZombie(zombieNames[0]);
            let eventFilter = contractInstance.filters.NewZombie();
            let events = await contractInstance.queryFilter(eventFilter);
            const zombieId = events[0].args[0].toNumber();

            await contractInstance.connect(alice).approve(bob.address, zombieId);
            //console.log("approve " + zombieId);
            await contractInstance.connect(alice).transfer(bob.address, zombieId);
            //console.log("transfer " + zombieId);
            const newOwner = await contractInstance.ownerOf(zombieId);
            assert.equal(newOwner, bob.address);
        });
    });

    describe("Zombie Attack", function() {
        it("Zombies should be able to attach each other", async () =>{
            //create the first zombie (Alice)
            await contractInstance.connect(alice).createRandomZombie(zombieNames[0]);
            //create the second zombie (Bol)
            await contractInstance.connect(bob).createRandomZombie(zombieNames[1]);

            let eventFilter = contractInstance.filters.NewZombie();
            let events = await contractInstance.queryFilter(eventFilter);
            const aliceZombieId = events[0].args[0].toNumber();
            const bobZombieId = events[1].args[0].toNumber();
            
            //e ok asa ? 
            await network.provider.send("evm_increaseTime", [24*60*60]);//merge si cu 1, what the hell :D
            await network.provider.send("evm_mine")

            await contractInstance.attack(aliceZombieId, bobZombieId);
        });
    });
  });
});