
const service = require("./devices.service");
const validation = require("./devices.validation");

const listDevices = async (req, res) => {
  try {
    const data = await service.listDevices(req.accessToken);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("List devices error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch devices"
    });
  }
};

const getDevice = async (req, res) => {
  try {
    const data = await service.getDeviceById(
      req.accessToken,
      req.params.id
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get device error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch device"
    });
  }
};

const editDevice = async (req, res) => {
  const errors = validation.validateDeviceUpdate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  try {
    const data = await service.updateDevice(
      req.accessToken,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Device updated successfully",
      data
    });
  } catch (error) {
    console.error("Update device error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update device"
    });
  }
};

const revokeDevice = async (req, res) => {
  try {
    const data = await service.revokeDevice(
      req.accessToken,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "Device revoked successfully",
      data
    });
  } catch (error) {
    console.error("Revoke device error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to revoke device"
    });
  }
};

module.exports = {
  listDevices,
  getDevice,
  editDevice,
  revokeDevice
};
