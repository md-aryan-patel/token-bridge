// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./baseToken.sol";
import "./Provable.sol";

contract TokenSwap is Oracle {
    address admin;
    BaseToken tokenEth;
    BaseToken tokenBtc;
    uint256 counter;

    mapping(address => mapping(uint256 => bool)) compleatedTransaction;

    enum State {
        ETH,
        BTC
    }

    constructor(address _token1, address _token2) payable Oracle() {
        admin = msg.sender;
        require(_token1 != _token2, "Swap: Both tokens are same");
        string memory name = BaseToken(_token1).name();
        if (keccak256(bytes(name)) == keccak256("UETHER")) {
            tokenEth = BaseToken(_token1);
            tokenBtc = BaseToken(_token2);
        } else if (keccak256(bytes(name)) == "UETHER") {
            tokenEth = BaseToken(_token2);
            tokenBtc = BaseToken(_token2);
        } else revert();
    }

    event Swap(
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp,
        uint256 chainId,
        bytes signature,
        State indexed state
    );

    event SwapMint(
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp,
        State indexed state
    );

    function burnEth(
        address _to,
        uint256 _amount,
        bytes calldata _signature,
        uint256 _chainId
    ) public {
        require(
            compleatedTransaction[msg.sender][counter] == false,
            "Bridge: Transaction already Exist"
        );
        compleatedTransaction[msg.sender][counter] = true;
        tokenEth.burn(msg.sender, _amount);
        updatePrice();
        emit Swap(
            msg.sender,
            _to,
            _amount,
            counter,
            block.timestamp,
            _chainId,
            _signature,
            State.ETH
        );
        counter++;
    }

    function burnBtc(
        address _to,
        uint256 _amount,
        bytes calldata _signature,
        uint256 _chainId
    ) public {
        require(
            compleatedTransaction[msg.sender][counter] == false,
            "Bridge: Transaction already Exist"
        );
        compleatedTransaction[msg.sender][counter] = true;
        tokenBtc.burn(msg.sender, _amount);
        updatePrice();
        emit Swap(
            msg.sender,
            _to,
            _amount,
            counter,
            block.timestamp,
            _chainId,
            _signature,
            State.BTC
        );
        counter++;
    }

    function mintBtc(
        address _from,
        address _to,
        uint256 _amount,
        uint256 _price,
        uint256 _nonce,
        bytes calldata signature
    ) public {
        bytes32 hash = getMessageHash(_from, _to, _amount);
        bytes32 ethHash = getEthSignedMessageHash(hash);
        address signer = recoverSigner(ethHash, signature);
        require(
            compleatedTransaction[_from][_nonce] == false,
            "Bridge: Transaction already Exist"
        );
        require(signer == _from, "Bridge: Invalid signer");
        uint256 mintAmount = (_price * _amount) / 10 ** 18;
        tokenBtc.mint(_to, mintAmount);
        emit SwapMint(
            msg.sender,
            _to,
            mintAmount,
            _nonce,
            block.timestamp,
            State.BTC
        );
    }

    function mintEth(
        address _from,
        address _to,
        uint256 _amount,
        uint256 _price,
        uint256 _nonce,
        bytes calldata signature
    ) public {
        bytes32 hash = getMessageHash(_from, _to, _amount);
        bytes32 ethHash = getEthSignedMessageHash(hash);
        address signer = recoverSigner(ethHash, signature);
        require(
            compleatedTransaction[_from][_nonce] == false,
            "Bridge: Transaction already Exist"
        );
        require(signer == _from, "Bridge: Invalid signer");
        uint256 mintAmount = (_amount * (10 ** 18)) / _price;
        tokenEth.mint(_to, mintAmount);
        emit SwapMint(
            msg.sender,
            _to,
            mintAmount,
            _nonce,
            block.timestamp,
            State.ETH
        );
    }

    // Signature verification
    function getMessageHash(
        address _from,
        address _to,
        uint _amount
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_from, _to, _amount));
    }

    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function verify(
        address _signer,
        address _to,
        uint _amount,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_signer, _to, _amount);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
