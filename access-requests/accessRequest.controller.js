
const {
  createAccessRequest
} = require("./accessRequest.service");

async function submitAccessRequest(req, res) {
  try {
    const createdRequest = await createAccessRequest({
      userId: req.user.id,
      companyId: req.user.company_id,
      accessToken: req.accessToken,
      requestData: req.validatedBody
    });

    return res.status(201).json({
      success: true,
      message: "Access request submitted successfully",
      data: createdRequest
    });
  } catch (error) {
    console.error("Submit access request:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Something went wrong while submitting the request"
    });
  }
}

module.exports = { submitAccessRequest };
