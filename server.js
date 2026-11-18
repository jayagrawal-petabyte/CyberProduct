
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// Existing team modules — keep these unchanged.
const accessRequestRoutes = require("./access-requests/accessRequest.routes");
const approvalRoutes = require("./approvals/approval.routes");

// Resources module.
const {
  createUserSupabaseClient,
} = require("./config/supabase");

const {
  createResourceService,
} = require("./resources/resource.service");

const {
  createResourceController,
} = require("./resources/resource.controller");

const {
  createResourceRoutes,
} = require("./resources/resource.routes");

const {
  authenticate,
  requireSecurityAdmin,
} = require("./auth/auth.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check.
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CyberProduct backend is running",
  });
});

// Existing Access Requests API.
app.use("/api/v1/access-requests", accessRequestRoutes);

// Existing Approvals API.
app.use("/api/v1/approvals", approvalRoutes);

// Initialize Resources controller with request-scoped Supabase clients.
const resourceController = createResourceController({
  createUserSupabaseClient,
  createResourceService,
});

// Initialize Resources routes.
const resourceRoutes = createResourceRoutes({
  resourceController,
  authenticate,
  requireSecurityAdmin,
});

// Mount Resources API.
app.use("/api/v1/resources", resourceRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CyberProduct API running on port ${PORT}`);
  });
}

module.exports = app;
