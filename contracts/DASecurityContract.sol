pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';

contract DASecurityContract is StandardToken, MintableToken, BurnableToken {
  string public symbol;
  string public name;
  uint8 public decimals;

  constructor (string symbol_, string name_, uint8 decimals_, uint256 totalSupply, address owner) public {
    symbol = symbol_;
    name = name_;
    decimals = decimals_;
    totalSupply_ = totalSupply;
    balances[owner] = totalSupply;
    
    transferOwnership(owner);
    emit Transfer(0x0, owner, totalSupply);
  }
}
