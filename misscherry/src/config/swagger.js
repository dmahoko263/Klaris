import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.4",
    info: {
      title: "MissCherry Pharma Trace API",
      version: "1.0.0",
      description: "API documentation for the pharmaceutical blockchain tracking system",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterBatchRequest: {
          type: "object",
          required: [
            "batchId",
            "drugName",
            "manufacturerName",
            "manufactureDate",
            "expiryDate"
          ],
          properties: {
            batchId: { type: "integer", example: 101 },
            drugName: { type: "string", example: "Amoxicillin" },
            manufacturerName: { type: "string", example: "MissCherry Labs" },
            manufactureDate: { type: "integer", example: 1735689600 },
            expiryDate: { type: "integer", example: 1767225600 },
            metadataURI: { type: "string", example: "ipfs://example" },
          },
        },
        TransferOwnershipRequest: {
          type: "object",
          required: ["batchId", "newOwner"],
          properties: {
            batchId: { type: "integer", example: 101 },
            newOwner: {
              type: "string",
              example: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
            },
            note: { type: "string", example: "Sent to distributor" },
          },
        },
        RecallBatchRequest: {
          type: "object",
          properties: {
            reason: { type: "string", example: "Contamination detected" },
          },
        },
        VerifyLogRequest: {
          type: "object",
          properties: {
            note: { type: "string", example: "Patient scanned at pharmacy" },
          },
        },
        WalletRoleRequest: {
          type: "object",
          required: ["account"],
          properties: {
            account: {
              type: "string",
              example: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}