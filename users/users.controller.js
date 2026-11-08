
const service = require("./users.service");
const validation = require("./users.validation");

const listProfiles = async (req, res) => {
  try {
    const data = await service.getProfiles(req.accessToken);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("List profiles error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch profiles"
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const data = await service.getProfileById(
      req.accessToken,
      req.params.id
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch profile"
    });
  }
};

const editProfile = async (req, res) => {
  const errors = validation.validateProfileUpdate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  try {
    const data = await service.updateProfile(
      req.accessToken,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update profile"
    });
  }
};

module.exports = {
  listProfiles,
  getProfile,
  editProfile
};
