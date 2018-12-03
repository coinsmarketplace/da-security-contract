pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'openzeppelin-solidity/contracts/ownership/Whitelist.sol';

contract DASecurityContract is StandardToken, MintableToken, BurnableToken, Whitelist {
  string public symbol;
  string public name;
  uint8 public decimals;
  address[] public WhiteListAddresses;

  constructor (
    string symbol_,
    string name_,
    uint8 decimals_,
    uint256 totalSupply,
    address owner,
    address supplyOwnerAddress
  ) public {
    symbol = symbol_;
    name = name_;
    decimals = decimals_;
    totalSupply_ = totalSupply;
    balances[supplyOwnerAddress] = totalSupply;
    
    WhiteListAddresses.push(owner); 
    WhiteListAddresses.push(supplyOwnerAddress);

    addAddressesToWhitelist(WhiteListAddresses);
    transferOwnership(owner);
    emit Transfer(0x0, owner, totalSupply);
  }
  
  modifier onlyRecipientWhitelisted(address _to) {
    checkRole(_to, ROLE_WHITELISTED);
    _;
  }

  function transfer(
    address _to,
    uint256 _value
  ) 
    public
    onlyRecipientWhitelisted(_to)
    returns (bool) 
  {
    BasicToken.transfer(_to, _value);
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    onlyRecipientWhitelisted(_to)
    returns (bool)
  {
    StandardToken.transferFrom(_from, _to, _value);
  }

  function approve(
    address _spender,
    uint256 _value
  ) public
    onlyRecipientWhitelisted(_spender)
    returns (bool)
  {
    StandardToken.approve(_spender, _value);
  }

  function mint(
    address _to,
    uint256 _amount
  )
    hasMintPermission
    canMint
    onlyRecipientWhitelisted(_to)
    public
    returns (bool)
  {
    MintableToken.mint(_to, _amount);
  }

}
