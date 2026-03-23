import { Router } from "express";
import {
  createWalletRole,
  fetchWalletRole,
  fetchAllWalletRoles,
  disableWalletRole,
  removeWalletRole,
} from "../controllers/walletRole.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Wallet Roles
 *   description: Manage blockchain wallet roles in the database
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WalletRole:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "7a9f7d2f-0fd1-4f0f-a5ff-7e8d527f7d8a"
 *         walletAddress:
 *           type: string
 *           example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
 *         role:
 *           type: string
 *           enum: [admin, manufacturer, distributor, pharmacy, patient]
 *           example: "manufacturer"
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateWalletRoleRequest:
 *       type: object
 *       required:
 *         - walletAddress
 *         - role
 *       properties:
 *         walletAddress:
 *           type: string
 *           example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
 *         role:
 *           type: string
 *           enum: [admin, manufacturer, distributor, pharmacy, patient]
 *           example: "manufacturer"
 *
 *     WalletRoleResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         walletRole:
 *           $ref: '#/components/schemas/WalletRole'
 *
 *     WalletRolesResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         walletRoles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WalletRole'
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Wallet role deleted successfully"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Wallet role not found"
 */

/**
 * @swagger
 * /api/wallet-roles:
 *   post:
 *     summary: Create or update a wallet role
 *     tags: [Wallet Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWalletRoleRequest'
 *     responses:
 *       201:
 *         description: Wallet role created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletRoleResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", createWalletRole);

/**
 * @swagger
 * /api/wallet-roles:
 *   get:
 *     summary: Get all wallet roles
 *     tags: [Wallet Roles]
 *     responses:
 *       200:
 *         description: List of wallet roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletRolesResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", fetchAllWalletRoles);

/**
 * @swagger
 * /api/wallet-roles/{walletAddress}:
 *   get:
 *     summary: Get a wallet role by wallet address
 *     tags: [Wallet Roles]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
 *     responses:
 *       200:
 *         description: Wallet role found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletRoleResponse'
 *       404:
 *         description: Wallet role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:walletAddress", fetchWalletRole);

/**
 * @swagger
 * /api/wallet-roles/{walletAddress}/deactivate:
 *   patch:
 *     summary: Deactivate a wallet role
 *     tags: [Wallet Roles]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
 *     responses:
 *       200:
 *         description: Wallet role deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletRoleResponse'
 *       404:
 *         description: Wallet role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:walletAddress/deactivate", disableWalletRole);

/**
 * @swagger
 * /api/wallet-roles/{walletAddress}:
 *   delete:
 *     summary: Delete a wallet role
 *     tags: [Wallet Roles]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
 *     responses:
 *       200:
 *         description: Wallet role deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Wallet role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:walletAddress", removeWalletRole);

export default router;