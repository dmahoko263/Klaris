import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Creates a new user account in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "M Cherry"
 *               email:
 *                 type: string
 *                 example: "takunda@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, manufacturer, distributor, pharmacy, patient]
 *                 example: manufacturer
 *               walletAddress:
 *                 type: string
 *                 example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
 *               organizationName:
 *                 type: string
 *                 example: "MissCherry Labs"
 *               phone:
 *                 type: string
 *                 example: "0771234567"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               message: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     description: Authenticates a user and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "takunda@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               token: "JWT_TOKEN_HERE"
 *               user:
 *                 id: "uuid"
 *                 email: "takunda@example.com"
 *                 role: "manufacturer"
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", login);

export default router;