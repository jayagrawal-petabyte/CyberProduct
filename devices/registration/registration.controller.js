
const service = require("./registration.service");
const validation = require("./registration.validation");

const registerDevice = async (req, res) => {
  const errors = validation.validateRegistration(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  try {
    const data = await service.registerDevice(
      req.accessToken,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Device registered successfully",
      data
    });
  } catch (error) {
    console.error("Register device error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to register device"
    });
  }
};

module.exports = { registerDevice };
