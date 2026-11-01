
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const accessRequestRoutes =
  require("./access-requests/accessRequest.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CyberProduct backend is running"
  });
});

app.use(
  "/api/v1/access-requests",
  accessRequestRoutes
);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CyberProduct API running on port ${PORT}`);
  });
}

module.exports = app;
