// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthRecord {
    struct Record {
        string ipfsHash;
        address owner;
    }

    Record[] public records;
    mapping(uint256 => mapping(address => bool)) public access;

    function addRecord(string memory _hash) external {
        records.push(Record(_hash, msg.sender));
    }

    function grantAccess(uint256 _id, address _doctor) external {
        require(records[_id].owner == msg.sender, "Not owner");
        access[_id][_doctor] = true;
    }

    function recordCount() external view returns(uint) {
        return records.length;
    }
}
