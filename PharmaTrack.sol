// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DrugSupplyChain_OptionA is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE  = keccak256("DISTRIBUTOR_ROLE");

    enum Status { Registered, InTransit, Delivered, Recalled }

    struct Batch {
        uint256 batchId;
        string drugName;
        string manufacturerName;
        uint256 manufactureDate; // unix timestamp
        uint256 expiryDate;      // unix timestamp
        string metadataURI;      // IPFS/HTTPS optional
        bytes32 batchQrHash;     // keccak256(payload string)
        address manufacturer;
        address currentOwner;
        Status status;
        bool exists;
    }

    struct Unit {
        uint256 batchId;         // link pill -> batch
        bytes32 engravedIdHash;  // keccak256(engravedId) (optional)
        bytes32 unitQrHash;      // keccak256(unit QR payload) (optional)
        bool exists;
    }

    mapping(uint256 => Batch) private batches;

    // We allow lookup by either engraved hash OR unit QR hash
    mapping(bytes32 => Unit) private unitsByEngravedHash;
    mapping(bytes32 => Unit) private unitsByQrHash;

    event BatchRegistered(uint256 indexed batchId, address indexed manufacturer, bytes32 batchQrHash);
    event UnitRegistered(uint256 indexed batchId, bytes32 indexed engravedIdHash, bytes32 indexed unitQrHash);
    event OwnershipTransferred(uint256 indexed batchId, address indexed from, address indexed to);
    event StatusUpdated(uint256 indexed batchId, Status newStatus);

    constructor(address admin) {
        require(admin != address(0), "admin=0");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // -------------------------
    // Admin: roles
    // -------------------------
    function addManufacturer(address a) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, a);
    }

    function addDistributor(address a) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, a);
    }

    // -------------------------
    // Scenario 1: Register batch
    // -------------------------
    function registerBatch(
        uint256 batchId,
        string calldata drugName,
        string calldata manufacturerName,
        uint256 manufactureDate,
        uint256 expiryDate,
        string calldata metadataURI,
        bytes32 batchQrHash
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(batchId != 0, "batchId=0");
        require(!batches[batchId].exists, "batch exists");
        require(bytes(drugName).length > 0, "drugName empty");
        require(bytes(manufacturerName).length > 0, "mfgName empty");
        require(expiryDate > manufactureDate, "bad dates");
        require(batchQrHash != bytes32(0), "batchQrHash=0");

        batches[batchId] = Batch({
            batchId: batchId,
            drugName: drugName,
            manufacturerName: manufacturerName,
            manufactureDate: manufactureDate,
            expiryDate: expiryDate,
            metadataURI: metadataURI,
            batchQrHash: batchQrHash,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            status: Status.Registered,
            exists: true
        });

        emit BatchRegistered(batchId, msg.sender, batchQrHash);
    }

    // -------------------------
    // Register a single pill/unit
    // - engravedIdHash can be 0 if you only want unit QR
    // - unitQrHash can be 0 if you only want engraved ID
    // -------------------------
    function registerUnit(
        uint256 batchId,
        bytes32 engravedIdHash,
        bytes32 unitQrHash
    ) external onlyRole(MANUFACTURER_ROLE) {
        Batch storage b = batches[batchId];
        require(b.exists, "batch not found");
        require(engravedIdHash != bytes32(0) || unitQrHash != bytes32(0), "no unit id");

        // Prevent duplicates if provided
        if (engravedIdHash != bytes32(0)) {
            require(!unitsByEngravedHash[engravedIdHash].exists, "engraved exists");
        }
        if (unitQrHash != bytes32(0)) {
            require(!unitsByQrHash[unitQrHash].exists, "qr exists");
        }

        Unit memory u = Unit({
            batchId: batchId,
            engravedIdHash: engravedIdHash,
            unitQrHash: unitQrHash,
            exists: true
        });

        if (engravedIdHash != bytes32(0)) unitsByEngravedHash[engravedIdHash] = u;
        if (unitQrHash != bytes32(0)) unitsByQrHash[unitQrHash] = u;

        emit UnitRegistered(batchId, engravedIdHash, unitQrHash);
    }

    // -------------------------
    // Scenario 2: Transfer ownership (batch level)
    // -------------------------
    function transferOwnership(uint256 batchId, address newOwner) external {
        require(newOwner != address(0), "newOwner=0");
        Batch storage b = batches[batchId];
        require(b.exists, "batch not found");
        require(b.status != Status.Recalled, "recalled");
        require(msg.sender == b.currentOwner, "not owner");

        address oldOwner = b.currentOwner;
        b.currentOwner = newOwner;
        b.status = Status.InTransit;

        emit OwnershipTransferred(batchId, oldOwner, newOwner);
        emit StatusUpdated(batchId, b.status);
    }

    function markDelivered(uint256 batchId) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch not found");
        require(b.status != Status.Recalled, "recalled");

        require(
            msg.sender == b.currentOwner || hasRole(DISTRIBUTOR_ROLE, msg.sender),
            "not allowed"
        );

        b.status = Status.Delivered;
        emit StatusUpdated(batchId, b.status);
    }

    function recallBatch(uint256 batchId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Batch storage b = batches[batchId];
        require(b.exists, "batch not found");
        b.status = Status.Recalled;
        emit StatusUpdated(batchId, b.status);
    }

    // -------------------------
    // Verification (Patient)
    // -------------------------

    // Verify box/bottle QR (batch-level)
    function verifyBatchByQR(uint256 batchId, bytes32 scannedBatchQrHash)
        external
        view
        returns (bool valid, string memory reason)
    {
        Batch storage b = batches[batchId];
        if (!b.exists) return (false, "BATCH_NOT_FOUND");
        if (b.status == Status.Recalled) return (false, "RECALLED");
        if (block.timestamp > b.expiryDate) return (false, "EXPIRED");
        if (scannedBatchQrHash != b.batchQrHash) return (false, "QR_MISMATCH");
        return (true, "AUTHENTIC");
    }

    // Verify pill by engraved ID hash
    function verifyUnitByEngraved(bytes32 engravedIdHash)
        external
        view
        returns (bool valid, string memory reason, uint256 batchId)
    {
        Unit storage u = unitsByEngravedHash[engravedIdHash];
        if (!u.exists) return (false, "UNIT_NOT_FOUND", 0);

        Batch storage b = batches[u.batchId];
        if (!b.exists) return (false, "BATCH_NOT_FOUND", 0);
        if (b.status == Status.Recalled) return (false, "RECALLED", b.batchId);
        if (block.timestamp > b.expiryDate) return (false, "EXPIRED", b.batchId);

        return (true, "AUTHENTIC", b.batchId);
    }

    // Verify pill by unit QR hash
    function verifyUnitByQR(bytes32 unitQrHash)
        external
        view
        returns (bool valid, string memory reason, uint256 batchId)
    {
        Unit storage u = unitsByQrHash[unitQrHash];
        if (!u.exists) return (false, "UNIT_NOT_FOUND", 0);

        Batch storage b = batches[u.batchId];
        if (!b.exists) return (false, "BATCH_NOT_FOUND", 0);
        if (b.status == Status.Recalled) return (false, "RECALLED", b.batchId);
        if (block.timestamp > b.expiryDate) return (false, "EXPIRED", b.batchId);

        return (true, "AUTHENTIC", b.batchId);
    }

    // -------------------------
    // UI helper reads
    // -------------------------
    function getBatch(uint256 batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "batch not found");
        return batches[batchId];
    }
}