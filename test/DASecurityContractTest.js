
const { assertRevert } = require('./helpers/assertRevert');
const DASecurityContract = artifacts.require("DASecurityContract");

contract('DASecurityContract', function(accounts) {
    let deployedAccount = accounts[0];
    let OwnerAccount = accounts[1];
    let supplyOwnerAccount = accounts[2];
    let clientAccount = accounts[3];
    let clientAccount2 = accounts[4];

    let daSecurityContract;

    beforeEach(async function() {
        daSecurityContract = await DASecurityContract.new('security_da', 'security_da', '2', '200000000', OwnerAccount, supplyOwnerAccount);
    });

    it('should return the correct totalSupply', async function() {
        let totalSupply = await daSecurityContract.totalSupply();

        assert.equal(totalSupply.toNumber(), 200000000);
    });

    it('creation: test correct setting information', async () => {
        const symbol = await daSecurityContract.symbol.call();
        assert.equal(symbol, 'security_da');

        const name = await daSecurityContract.name.call();
        assert.equal(name, 'security_da');
    
        const decimals = await daSecurityContract.decimals.call();
        assert.equal(decimals.toNumber(), 2);

        const owner = await daSecurityContract.owner.call();
        assert.equal(owner, OwnerAccount);
    });

    it('check the balance of the contract owner and the deployed address', async () => {
        let supplyOwnerAccountBalance = await daSecurityContract.balanceOf.call(supplyOwnerAccount);
        assert.equal(supplyOwnerAccountBalance.toNumber(), 200000000);

        let ownerAccountBalance = await daSecurityContract.balanceOf.call(OwnerAccount);
        assert.equal(ownerAccountBalance.toNumber(), 0);

        let deployedAccountBalance = await daSecurityContract.balanceOf.call(deployedAccount);
        assert.equal(deployedAccountBalance.toNumber(), 0);
    });
    
    it('Successfully mint total supply to client account', async () => {
        let clientAccountBalance = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalance.toNumber(), 0);

         await daSecurityContract.addAddressToWhitelist(clientAccount, { from: OwnerAccount });

        await daSecurityContract.mint(clientAccount, 2000, { from: OwnerAccount });

        let newTotalSupply = await daSecurityContract.totalSupply();
        assert.equal(newTotalSupply.toNumber(), 200002000);

        let clientAccountBalanceAfterMint = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalanceAfterMint.toNumber(), 2000);
    });

    it('Mint should fail becuase who run the mint function is not ownable user anymore', (done) => {
        daSecurityContract.mint(clientAccount, 2000, { from: deployedAccount }).catch(error => {
            done();
        })
    });

    it('Mint should fail becuase the reciever does not exist on the whitelist', (done) => {
        daSecurityContract.mint(clientAccount2, 2000, { from: OwnerAccount }).catch(error => {
            done();
        })
    });

    it('Mint should fail becuase who run the mint function is not the owner', (done) => {
        daSecurityContract.mint(clientAccount, 2000, { from: supplyOwnerAccount }).catch(error => {
            done();
        })
    });

    it('Burn from total supply', async () => {
        let totalSupply = await daSecurityContract.totalSupply();
        assert.equal(totalSupply.toNumber(), 200000000);

        await daSecurityContract.burn(2000, { from: supplyOwnerAccount });

        let totalSupplyAfterBurn = await daSecurityContract.totalSupply();
        assert.equal(totalSupplyAfterBurn.toNumber(), 199998000);
    });

    it('Faild to burn from total supply - the account that tried to burn did not has any tokens', (done) => {
        daSecurityContract.burn(2000, { from: deployedAccount }).catch(error => {
            done();
        })
    });

    it('Faild to burn from total supply - tried to burn more than exist on total supply', (done) => {
        daSecurityContract.burn(200000001, { from: supplyOwnerAccount }).catch(error => {
            done();
        })
    });

    it('Faild to burn from total supply - the account does not have tokens to burn', (done) => {
        daSecurityContract.burn(200, { from: OwnerAccount }).catch(error => {
            done();
        })
    });

    it('Shoud success to transfer tokens to client account', async () => {
        let clientAccountBalance = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalance.toNumber(), 0);

        await daSecurityContract.addAddressToWhitelist(clientAccount, { from: OwnerAccount });

        await daSecurityContract.transfer(clientAccount, 2000, { from: supplyOwnerAccount });

        let clientAccountBalanceAfterTransfer = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalanceAfterTransfer.toNumber(), 2000);
    });

    it('Faild to transfer because the deployed account did not has any tokens on her account', (done) => {
        daSecurityContract.transfer(clientAccount, 2000, { from: deployedAccount }).catch(error => {
            done();
        })
    });

    it('Faild to transfer because the reciever address does not exist on the whitelist', (done) => {
        daSecurityContract.transfer(clientAccount2, 2000, { from: OwnerAccount }).catch(error => {
            done();
        })
    });

    it('Checking the whitelist addresses', async () => {
       await daSecurityContract.addAddressToWhitelist(clientAccount, { from: OwnerAccount });

       let ownerAddress = await daSecurityContract.whitelist(OwnerAccount);
       assert.equal(ownerAddress, true);

       let existAddress = await daSecurityContract.whitelist(clientAccount);
       assert.equal(existAddress, true);

       let notExistAddress = await daSecurityContract.whitelist(clientAccount2);
       assert.equal(notExistAddress, false);
    });

    it('Faild to add client to the whitelist because who tried to run the func is not the owner', (done) => {
        daSecurityContract.addAddressToWhitelist(clientAccount, { from: deployedAccount }).catch(error => {
            done();
        })
    });

    it('TransferFrom should success - the owner approved to account use 20', async () => {
        let supplyOwnerAccountBalance = await daSecurityContract.balanceOf.call(supplyOwnerAccount);
        assert.strictEqual(supplyOwnerAccountBalance.toNumber(), 200000000);

        await daSecurityContract.addAddressToWhitelist(clientAccount, { from: OwnerAccount });

        await daSecurityContract.approve(clientAccount, 20, { from: supplyOwnerAccount });
        let allowance = await daSecurityContract.allowance.call(supplyOwnerAccount, clientAccount);
        assert.strictEqual(allowance.toNumber(), 20);

        let accountBalance = await daSecurityContract.balanceOf.call(clientAccount2);
        assert.strictEqual(accountBalance.toNumber(), 0);

        // Need to set "to" address on whitelist
        await daSecurityContract.addAddressToWhitelist(clientAccount2, { from: OwnerAccount });

        await daSecurityContract.transferFrom(supplyOwnerAccount, clientAccount2, 20, { from: clientAccount });
        allowance = await daSecurityContract.allowance.call(supplyOwnerAccount, clientAccount);
        assert.strictEqual(allowance.toNumber(), 0);

        accountBalance = await daSecurityContract.balanceOf.call(clientAccount2);
        assert.strictEqual(accountBalance.toNumber(), 20);

        supplyOwnerAccountBalance = await daSecurityContract.balanceOf.call(supplyOwnerAccount);
        assert.strictEqual(supplyOwnerAccountBalance.toNumber(), 199999980);
    });
    
    it('Approve should failed - the client not exist on the whitelist', (done) => {
        daSecurityContract.approve(clientAccount, 2000, { from: OwnerAccount }).catch(error => {
            done();
        })
    });

});
