
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// Existing team modules.
const accessRequestRoutes = require("./access-requests/accessRequest.routes");
const approvalRoutes = require("./approvals/approval.routes");

// Shared Supabase configuration.
const {
  createUserSupabaseClient,
} = require("./config/supabase");

// Authentication and authorization middleware.
const {
  authenticate,
  requireSecurityAdmin,
} = require("./auth/auth.middleware");

// Resources module.
const {
  createResourceService,
} = require("./resources/resource.service");

const {
  createResourceController,
} = require("./resources/resource.controller");

const {
  createResourceRoutes,
} = require("./resources/resource.routes");

// Resource Categories module.
const {
  createCategoryRouter,
} = require("./resources/categories/category.routes");

// Policies module.
const {
  createPolicyRoutes,
} = require("./policies/policy.routes");

const app = express();

// Global middleware.
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
app.use(
  "/api/v1/access-requests",
  accessRequestRoutes
);

// Existing Approvals API.
app.use(
  "/api/v1/approvals",
  approvalRoutes
);

// Initialize Resources module.
const resourceController = createResourceController({
  createUserSupabaseClient,
  createResourceService,
});

const resourceRoutes = createResourceRoutes({
  resourceController,
  authenticate,
  requireSecurityAdmin,
});

// Mount Resources API.
app.use(
  "/api/v1/resources",
  resourceRoutes
);

// Initialize Resource Categories module.
const categoryRoutes = createCategoryRouter({
  createUserSupabaseClient,
  authenticate,
  requireSecurityAdmin,
});

// Mount Resource Categories API.
app.use(
  "/api/v1/resource-categories",
  categoryRoutes
);

// Initialize Policies module.
const policyRoutes = createPolicyRoutes({
  authenticate,
  requireSecurityAdmin,
});

// Mount Policies API.
app.use(
  "/api/v1/policies",
  policyRoutes
);

// Start server.
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CyberProduct API running on port ${PORT}`);
  });
}

module.exports = app;
