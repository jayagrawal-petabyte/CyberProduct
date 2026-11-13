
const {
  createApprovalService
} = require("./approval.service");

const {
  createUserSupabaseClient,
  createServiceSupabaseClient
} = require("../config/supabase");

const {
  createGrantService
} = require("./grants/grant.service");

const {
  createPolicyEvaluator
} = require("./grants/policy-evaluator");

async function decideAccessRequest(req, res, decision) {
  try {
    // Use the authenticated user's client for approval decisions.
    const userSupabase = createUserSupabaseClient(req.accessToken);
    const approvalService = createApprovalService(userSupabase);

    const decisionData = {
      requestId: req.params.requestId,
      companyId: req.user.company_id,
      decisionReason: req.body?.decision_reason ?? null
    };

    // Rejected requests do not need policy evaluation or grants.
    if (decision === "rejected") {
      const rejectedRequest =
        await approvalService.rejectRequest(decisionData);

      return res.status(200).json({
        success: true,
        message: "Access request rejected successfully.",
        data: rejectedRequest
      });
    }

    // Fetch the pending request before changing its status.
    const pendingRequest =
      await approvalService.getPendingRequest({
        requestId: decisionData.requestId,
        companyId: decisionData.companyId
      });

    // Use the service-role client for policy evaluation and grant creation.
    const serviceSupabase = createServiceSupabaseClient();

    const policyEvaluator =
      createPolicyEvaluator(serviceSupabase);

    // Evaluate policies BEFORE approving the request.
    const evaluation =
      await policyEvaluator.evaluateAccessRequest(
        pendingRequest
      );

    // Approve only after policy evaluation succeeds.
    const approvedRequest =
      await approvalService.approveRequest(decisionData);

    const grantService =
      createGrantService(serviceSupabase);

    const grant = await grantService.createGrant(
      approvedRequest,
      evaluation.durationMinutes
    );

    return res.status(200).json({
      success: true,
      message: "Access request approved and grant created successfully.",
      data: {
        request: approvedRequest,
        grant,
        policy: evaluation.selectedPolicy
      }
    });
  } catch (error) {
    console.error(
      "Access request decision:",
      error.message
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Something went wrong while processing the decision."
    });
  }
}

async function approveAccessRequest(req, res) {
  return decideAccessRequest(req, res, "approved");
}

async function rejectAccessRequest(req, res) {
  return decideAccessRequest(req, res, "rejected");
}

module.exports = {
  approveAccessRequest,
  rejectAccessRequest
};
