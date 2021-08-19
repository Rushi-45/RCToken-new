pragma solidity ^0.5.2;

import "./RCToken.sol";

contract RCTokenSale {
    address payable admin;
    RCToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(RCToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender; // assign an admin
        tokenContract = _tokenContract; // token contract
        tokenPrice = _tokenPrice; // token price
    }
     // multiply function
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that value equal to tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that contract has enough tokens
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Require that a transfer is successful
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens); // Trigger Sell Event
    }
    
    // Ending TokenSale
    function endSale() public {
        require(msg.sender == admin); // Require admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );
        // Transfer remaining tokens to the admin
        selfdestruct(admin); // Destroy contract
    }
}