// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract MissCherryPharmaTrace is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    enum BatchStatus {
        Registered,
        InTransit,
        Delivered,
        Recalled
    }

    struct Batch {
        uint256 batchId;
        string drugName;
        string manufacturerName;
        uint256 manufactureDate;
        uint256 expiryDate;
        string metadataURI;
        address manufacturer;
        address currentOwner;
        BatchStatus status;
        bool exists;
        bool suspicious;
        uint256 verificationCount;
        uint256 uniqueVerifierCount;
        uint256 createdAt;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 timestamp;
        string note;
    }

    struct VerificationRecord {
        address verifier;
        uint256 timestamp;
        bool validAtScan;
        string note;
    }

    mapping(uint256 => Batch) private batches;
    mapping(uint256 => OwnershipRecord[]) private ownershipHistory;
    mapping(uint256 => VerificationRecord[]) private verificationHistory;

    // Prevent counting same verifier more than once in uniqueVerifierCount
    mapping(uint256 => mapping(address => bool)) private hasVerifiedBefore;

    // Optional registry of approved supply chain actors
    mapping(address => bool) public approvedSupplyChainActors;

    uint256 public suspiciousScanThreshold = 5;
    uint256 public suspiciousUniqueVerifierThreshold = 3;

    event BatchRegistered(
        uint256 indexed batchId,
        string drugName,
        address indexed manufacturer,
        uint256 expiryDate
    );

    event OwnershipTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        string note
    );

    event BatchDelivered(
        uint256 indexed batchId,
        address indexed by
    );

    event BatchRecalled(
        uint256 indexed batchId,
        address indexed recalledBy,
        string reason
    );

    event BatchVerified(
        uint256 indexed batchId,
        address indexed verifier,
        bool valid,
        string note
    );

    event BatchFlaggedSuspicious(
        uint256 indexed batchId,
        string reason
    );

    constructor(address admin) {
        require(admin != address(0), "Invalid admin");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANUFACTURER_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        _grantRole(PHARMACY_ROLE, admin);

        approvedSupplyChainActors[admin] = true;
    }

    // =========================================================
    // ADMIN / ROLE MANAGEMENT
    // =========================================================

    function addManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, account);
        approvedSupplyChainActors[account] = true;
    }

    function addDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, account);
        approvedSupplyChainActors[account] = true;
    }

    function addPharmacy(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PHARMACY_ROLE, account);
        approvedSupplyChainActors[account] = true;
    }

    function removeManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MANUFACTURER_ROLE, account);
    }

    function removeDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(DISTRIBUTOR_ROLE, account);
    }

    function removePharmacy(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(PHARMACY_ROLE, account);
    }

    function setSupplyChainActor(address account, bool approved) external onlyRole(DEFAULT_ADMIN_ROLE) {
        approvedSupplyChainActors[account] = approved;
    }

    function setSuspiciousThresholds(
        uint256 scanThreshold,
        uint256 uniqueVerifierThreshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(scanThreshold > 0, "scanThreshold=0");
        require(uniqueVerifierThreshold > 0, "uniqueVerifierThreshold=0");

        suspiciousScanThreshold = scanThreshold;
        suspiciousUniqueVerifierThreshold = uniqueVerifierThreshold;
    }

    // =========================================================
    // SCENARIO 1: REGISTER BATCH
    // =========================================================

    function registerBatch(
        uint256 batchId,
        string calldata drugName,
        string calldata manufacturerName,
        uint256 manufactureDate,
        uint256 expiryDate,
        string calldata metadataURI
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(batchId != 0, "batchId=0");
        require(!batches[batchId].exists, "Batch already exists");
        require(bytes(drugName).length > 0, "drugName required");
        require(bytes(manufacturerName).length > 0, "manufacturerName required");
        require(expiryDate > manufactureDate, "Invalid dates");

        batches[batchId] = Batch({
            batchId: batchId,
            drugName: drugName,
            manufacturerName: manufacturerName,
            manufactureDate: manufactureDate,
            expiryDate: expiryDate,
            metadataURI: metadataURI,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            status: BatchStatus.Registered,
            exists: true,
            suspicious: false,
            verificationCount: 0,
            uniqueVerifierCount: 0,
            createdAt: block.timestamp
        });

        ownershipHistory[batchId].push(
            OwnershipRecord({
                from: address(0),
                to: msg.sender,
                timestamp: block.timestamp,
                note: "Batch registered by manufacturer"
            })
        );

        emit BatchRegistered(batchId, drugName, msg.sender, expiryDate);
    }

    // =========================================================
    // SCENARIO 2: OWNERSHIP TRANSFER
    // =========================================================

    function transferOwnership(
        uint256 batchId,
        address newOwner,
        string calldata note
    ) external {
        require(newOwner != address(0), "newOwner=0");

        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(batch.status != BatchStatus.Recalled, "Batch recalled");
        require(msg.sender == batch.currentOwner, "Not current owner");
        require(approvedSupplyChainActors[newOwner], "New owner not approved");

        address oldOwner = batch.currentOwner;
        batch.currentOwner = newOwner;
        batch.status = BatchStatus.InTransit;

        ownershipHistory[batchId].push(
            OwnershipRecord({
                from: oldOwner,
                to: newOwner,
                timestamp: block.timestamp,
                note: note
            })
        );

        emit OwnershipTransferred(batchId, oldOwner, newOwner, note);
    }

    function markDelivered(uint256 batchId) external {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(batch.status != BatchStatus.Recalled, "Batch recalled");
        require(
            msg.sender == batch.currentOwner ||
            hasRole(DISTRIBUTOR_ROLE, msg.sender) ||
            hasRole(PHARMACY_ROLE, msg.sender),
            "Not authorized"
        );

        batch.status = BatchStatus.Delivered;
        emit BatchDelivered(batchId, msg.sender);
    }

    // =========================================================
    // SCENARIO 3: PATIENT VERIFIES DRUG
    // =========================================================
    // Gas-free read
    // Use this when frontend just wants authenticity result.

    function verifyBatch(uint256 batchId)
        public
        view
        returns (
            bool valid,
            string memory reason,
            string memory drugName,
            string memory manufacturerName,
            uint256 manufactureDate,
            uint256 expiryDate,
            address manufacturer,
            address currentOwner,
            BatchStatus status,
            bool suspicious,
            uint256 verificationCount
        )
    {
        Batch storage batch = batches[batchId];

        if (!batch.exists) {
            return (
                false,
                "BATCH_NOT_FOUND",
                "",
                "",
                0,
                0,
                address(0),
                address(0),
                BatchStatus.Registered,
                false,
                0
            );
        }

        if (batch.status == BatchStatus.Recalled) {
            return (
                false,
                "RECALLED",
                batch.drugName,
                batch.manufacturerName,
                batch.manufactureDate,
                batch.expiryDate,
                batch.manufacturer,
                batch.currentOwner,
                batch.status,
                batch.suspicious,
                batch.verificationCount
            );
        }

        if (block.timestamp > batch.expiryDate) {
            return (
                false,
                "EXPIRED",
                batch.drugName,
                batch.manufacturerName,
                batch.manufactureDate,
                batch.expiryDate,
                batch.manufacturer,
                batch.currentOwner,
                batch.status,
                batch.suspicious,
                batch.verificationCount
            );
        }

        if (batch.suspicious) {
            return (
                true,
                "AUTHENTIC_BUT_SUSPICIOUS",
                batch.drugName,
                batch.manufacturerName,
                batch.manufactureDate,
                batch.expiryDate,
                batch.manufacturer,
                batch.currentOwner,
                batch.status,
                batch.suspicious,
                batch.verificationCount
            );
        }

        return (
            true,
            "AUTHENTIC",
            batch.drugName,
            batch.manufacturerName,
            batch.manufactureDate,
            batch.expiryDate,
            batch.manufacturer,
            batch.currentOwner,
            batch.status,
            batch.suspicious,
            batch.verificationCount
        );
    }

    // =========================================================
    // SCENARIO 4: COUNTERFEIT DETECTION HEURISTIC
    // =========================================================
    // This is a state-changing verification that logs scans.
    // It does NOT mathematically prove a fake drug.
    // It flags suspicious behavior based on repeated scans.

    function verifyAndLog(uint256 batchId, string calldata note)
        external
        returns (
            bool valid,
            string memory reason
        )
    {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");

        (
            bool isValid,
            string memory why,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,

        ) = verifyBatch(batchId);

        batch.verificationCount += 1;

        if (!hasVerifiedBefore[batchId][msg.sender]) {
            hasVerifiedBefore[batchId][msg.sender] = true;
            batch.uniqueVerifierCount += 1;
        }

        verificationHistory[batchId].push(
            VerificationRecord({
                verifier: msg.sender,
                timestamp: block.timestamp,
                validAtScan: isValid,
                note: note
            })
        );

        emit BatchVerified(batchId, msg.sender, isValid, note);

        // Simple counterfeit/suspicious detection heuristics:
        // 1. Too many total scans
        // 2. Too many unique scanners
        if (
            batch.verificationCount >= suspiciousScanThreshold ||
            batch.uniqueVerifierCount >= suspiciousUniqueVerifierThreshold
        ) {
            if (!batch.suspicious) {
                batch.suspicious = true;
                emit BatchFlaggedSuspicious(
                    batchId,
                    "Repeated scans exceeded threshold"
                );
            }
        }

        return (isValid, why);
    }

    // Admin can manually clear suspicious flag if reviewed
    function clearSuspiciousFlag(uint256 batchId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        batch.suspicious = false;
    }

    // Admin can manually flag suspicious
    function flagSuspicious(uint256 batchId, string calldata reason)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");

        batch.suspicious = true;
        emit BatchFlaggedSuspicious(batchId, reason);
    }

    // =========================================================
    // SCENARIO 5: DRUG RECALL
    // =========================================================

    function recallBatch(uint256 batchId, string calldata reason)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(batch.status != BatchStatus.Recalled, "Already recalled");

        batch.status = BatchStatus.Recalled;

        emit BatchRecalled(batchId, msg.sender, reason);
    }

    // =========================================================
    // SCENARIO 6: SUPPLY CHAIN TRACKING / FULL HISTORY
    // =========================================================

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "Batch not found");
        return batches[batchId];
    }

    function getOwnershipHistory(uint256 batchId)
        external
        view
        returns (OwnershipRecord[] memory)
    {
        require(batches[batchId].exists, "Batch not found");
        return ownershipHistory[batchId];
    }

    function getVerificationHistory(uint256 batchId)
        external
        view
        returns (VerificationRecord[] memory)
    {
        require(batches[batchId].exists, "Batch not found");
        return verificationHistory[batchId];
    }

    function getVerificationStats(uint256 batchId)
        external
        view
        returns (
            uint256 totalVerifications,
            uint256 uniqueVerifiers,
            bool isSuspicious
        )
    {
        require(batches[batchId].exists, "Batch not found");
        Batch storage batch = batches[batchId];

        return (
            batch.verificationCount,
            batch.uniqueVerifierCount,
            batch.suspicious
        );
    }

    function batchExists(uint256 batchId) external view returns (bool) {
        return batches[batchId].exists;
    }

    function isExpired(uint256 batchId) public view returns (bool) {
        require(batches[batchId].exists, "Batch not found");
        return block.timestamp > batches[batchId].expiryDate;
    }

    function getCurrentOwner(uint256 batchId) external view returns (address) {
        require(batches[batchId].exists, "Batch not found");
        return batches[batchId].currentOwner;
    }
}