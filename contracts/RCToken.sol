pragma solidity ^0.5.2;

contract RCToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    uint256 public totalSupply;

    constructor() public {
        totalSupply = 1000000;
    }
}
