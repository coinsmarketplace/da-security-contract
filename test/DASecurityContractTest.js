
const { assertRevert } = require('./helpers/assertRevert');
const DASecurityContract = artifacts.require("DASecurityContract");

contract('DASecurityContract', function(accounts) {
    let deployedAccount = accounts[0];
    let OwnerAccount = accounts[1];
    let clientAccount = accounts[2];

    let daSecurityContract;

    beforeEach(async function() {
        daSecurityContract = await DASecurityContract.new('security_da', 'security_da', '2', '200000000', OwnerAccount);
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
        let ownerAccountBalance = await daSecurityContract.balanceOf.call(OwnerAccount);
        assert.equal(ownerAccountBalance.toNumber(), 200000000);

        let deployedAccountBalance = await daSecurityContract.balanceOf.call(deployedAccount);
        assert.equal(deployedAccountBalance.toNumber(), 0);
    });
    
    it('Mint total supply to client account', async () => {
        let clientAccountBalance = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalance.toNumber(), 0);

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

    it('Burn from total supply', async () => {
        let totalSupply = await daSecurityContract.totalSupply();
        assert.equal(totalSupply.toNumber(), 200000000);

        await daSecurityContract.burn(2000, { from: OwnerAccount });

        let totalSupplyAfterBurn = await daSecurityContract.totalSupply();
        assert.equal(totalSupplyAfterBurn.toNumber(), 199998000);
    });

    it('Faild to burn from total supply - the account that tried to burn did not has any tokens', (done) => {
        daSecurityContract.burn(2000, { from: deployedAccount }).catch(error => {
            done();
        })
    });

    it('Faild to burn from total supply - tried to burn more than exist on total supply', (done) => {
        daSecurityContract.burn(200000001, { from: OwnerAccount }).catch(error => {
            done();
        })
    });

    it('Shoud success to transfer tokens to client account', async () => {
        let clientAccountBalance = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalance.toNumber(), 0);

        await daSecurityContract.transfer(clientAccount, 2000, { from: OwnerAccount });

        let clientAccountBalanceAfterTransfer = await daSecurityContract.balanceOf.call(clientAccount);
        assert.equal(clientAccountBalanceAfterTransfer.toNumber(), 2000);
    });

    it('Faild to transfer because the deployed account did not has any tokens on her account', (done) => {
        daSecurityContract.transfer(clientAccount, 2000, { from: deployedAccount }).catch(error => {
            done();
        })
    });

});
