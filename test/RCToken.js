const RCToken = artifacts.require("./RCToken");

contract('RCToken', (accounts) => {
    let tokenInstance;
    it('initializes the contract with correct value', function () {
        return RCToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name) {
            assert.equal(name, 'RC Token', 'has the correct name');
            return tokenInstance.symbol();
        }).then(function (symbol) {
            assert.equal(symbol, 'RC', 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function (standard) {
            assert.equal(standard, 'RC Token v1.0', 'has the correct standard');
        })
    })

    it('allocates the initial supply upon development', () => {
        return RCToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply) => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets total supplies')
            return tokenInstance.balanceOf(accounts[0]);
        }).then((adminBalance) => {
            assert.equal(adminBalance.toNumber(), 1000000, 'allocates the initial supply to admin account.')
        })
    })

    it('transfers token ownership', () => {
        return RCToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 777777777777);
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert.')
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then((success) => {
            assert.equal(success, true, 'true');
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one events')
            assert.equal(receipt.logs[0].event, 'Transfer', '"Transfer event"')
            assert.equal(receipt.logs[0].args._from, accounts[0], "account 0")
            assert.equal(receipt.logs[0].args._to, accounts[1], "account 1")
            assert.equal(receipt.logs[0].args._value, 250000, "value")
            return tokenInstance.balanceOf(accounts[1]);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 250000, 'add the amount to the receiving account')
            return tokenInstance.balanceOf(accounts[0]);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account')
        })
    })

    it('Approve tokens for delegated transfer', () => {
        return RCToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then((success) => {
            assert.equal(success, true, 'true');
            return tokenInstance.approve(accounts[1], 100);
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one events')
            assert.equal(receipt.logs[0].event, 'Approval', '"Approval event"')
            assert.equal(receipt.logs[0].args._owner, accounts[0], "account 0")
            assert.equal(receipt.logs[0].args._spender, accounts[1], "account 1")
            assert.equal(receipt.logs[0].args._value, 100, "value")
            return tokenInstance.allowance(accounts[0], accounts[1])
        }).then((allowance) => {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer')
        })
    })
    it('handles delegated token transfer', () => {
        return RCToken.deployed().then((instance) => {
            tokenInstance = instance;
            from = accounts[2];
            to = accounts[3];
            spendingAccount = accounts[4];
            // Transfer some tokens to fromAccount
            return tokenInstance.transfer(from, 100, { from: accounts[0] });
        }).then(() => {
            // Approve spendingAccount to spend 10 token from fromAccount
            return tokenInstance.approve(spendingAccount, 10, { from });
        }).then(() => {
            // Try transferring larger than the sender's balance
            return tokenInstance.transferFrom(from, to, 7777, { from: spendingAccount });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer larger than balance');
            // Try transferring larger than the approved amount
            return tokenInstance.transferFrom(from, to, 20, { from: spendingAccount });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer larger than approved amount');
            return tokenInstance.transferFrom(from, to, 10, { from: spendingAccount });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one events')
            assert.equal(receipt.logs[0].event, 'Transfer', '"Transfer event"')
            assert.equal(receipt.logs[0].args._from, from, "from account")
            assert.equal(receipt.logs[0].args._to, to, "to account")
            assert.equal(receipt.logs[0].args._value, 10, "value")
            return tokenInstance.balanceOf(from)
        }).then((balance) => {
            assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account')
            return tokenInstance.balanceOf(to)
        }).then((balance) => {
            assert.equal(balance.toNumber(), 10, 'adds the amount from the sending account')
            return tokenInstance.allowance(from, to)
        }).then((allowance) => {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance')
        })
    })
})  