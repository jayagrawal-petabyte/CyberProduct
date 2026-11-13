/**
 * Company Configuration Service
 * CyberProduct Backend Architecture - Pallavi
 *
 * Implements business logic and trusted database operations for the `companies` table.
 * Adheres to PRD Section 3.1 & Supabase Schema constraints:
 *  - Company creation is a trusted backend operation using service-role.
 *  - No hard deletion; deactivation is managed via `status = 'inactive'`.
 *  - Immutable tenant identifier (`id`) and handle (`slug`).
 *  - `policy_version` starts at 1 and is maintained by database triggers.
 *  - `updated_at` is maintained by the `set_updated_at()` trigger.
 */

const { createServiceSupabaseClient } = require("./supabase");
const {
  NotFoundError,
  ConflictError,
  MethodNotAllowedError,
  ValidationError,
  AppError
} = require("./errors");
const logger = require("./logger");

const COMPANY_COLUMNS = [
  "id",
  "name",
  "slug",
  "status",
  "settings",
  "policy_version",
  "created_at",
  "updated_at"
].join(", ");

/**
 * Creates a new company tenant.
 * Must be executed through trusted backend operations using service role.
 *
 * @param {Object} params
 * @param {string} params.name - Company name
 * @param {string} params.slug - Unique company slug
 * @param {Object} [params.settings={}] - Company settings JSON
 * @param {string} [params.status="active"] - Initial status ('active' | 'inactive')
 * @returns {Promise<Object>} The created company record
 */
async function createCompany({ name, slug, settings = {}, status = "active" }) {
  const serviceSupabase = createServiceSupabaseClient();

  // Merge default settings
  const mergedSettings = {
    log_full_urls: false,
    ...settings
  };

  const payload = {
    name: name.trim(),
    slug: slug.trim().toLowerCase(),
    status,
    settings: mergedSettings,
    policy_version: 1
  };

  const { data, error } = await serviceSupabase
    .from("companies")
    .insert(payload)
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      logger.warn(`Company creation duplicate slug conflict: '${slug}'`);
      throw new ConflictError(`A company with slug '${slug}' already exists`);
    }

    logger.error("Company creation database error:", error.message);
    throw new AppError("Unable to create company", 500);
  }

  logger.info(`Company created successfully: '${data.name}' (${data.id})`);
  return data;
}

/**
 * Retrieves a company record by primary key UUID.
 *
 * @param {string} companyId - UUID of the company
 * @returns {Promise<Object>}
 * @throws {NotFoundError} If company does not exist
 */
async function getCompanyById(companyId) {
  const serviceSupabase = createServiceSupabaseClient();

  const { data, error } = await serviceSupabase
    .from("companies")
    .select(COMPANY_COLUMNS)
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    logger.error("Get company by ID error:", error.message);
    throw new AppError("Unable to retrieve company details", 500);
  }

  if (!data) {
    throw new NotFoundError("Company not found");
  }

  return data;
}

/**
 * Retrieves a company record by unique slug.
 *
 * @param {string} slug - Unique handle
 * @returns {Promise<Object>}
 * @throws {NotFoundError} If company does not exist
 */
async function getCompanyBySlug(slug) {
  const serviceSupabase = createServiceSupabaseClient();

  const { data, error } = await serviceSupabase
    .from("companies")
    .select(COMPANY_COLUMNS)
    .eq("slug", slug.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    logger.error("Get company by slug error:", error.message);
    throw new AppError("Unable to retrieve company details", 500);
  }

  if (!data) {
    throw new NotFoundError(`Company with slug '${slug}' not found`);
  }

  return data;
}

/**
 * Updates permitted settings for an existing company.
 * Note: Only `settings` are updated; primary key, slug, and policy_version are immutable.
 *
 * @param {string} companyId - Company UUID
 * @param {Object} settingsUpdates - Settings delta to merge
 * @returns {Promise<Object>} Updated company record
 */
async function updateCompanySettings(companyId, settingsUpdates) {
  // Ensure the company exists
  const existingCompany = await getCompanyById(companyId);

  const updatedSettings = {
    ...existingCompany.settings,
    ...settingsUpdates
  };

  const serviceSupabase = createServiceSupabaseClient();

  const { data, error } = await serviceSupabase
    .from("companies")
    .update({ settings: updatedSettings })
    .eq("id", companyId)
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    logger.error("Update company settings error:", error.message);
    throw new AppError("Unable to update company settings", 500);
  }

  logger.info(`Company settings updated: '${data.name}' (${data.id})`);
  return data;
}

/**
 * Updates company lifecycle status ('active' | 'inactive').
 * Deactivation cleanly locks out company users without data loss.
 *
 * @param {string} companyId - Company UUID
 * @param {"active"|"inactive"} status - New status
 * @returns {Promise<Object>} Updated company record
 */
async function updateCompanyStatus(companyId, status) {
  // Ensure company exists
  await getCompanyById(companyId);

  const serviceSupabase = createServiceSupabaseClient();

  const { data, error } = await serviceSupabase
    .from("companies")
    .update({ status })
    .eq("id", companyId)
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    logger.error("Update company status error:", error.message);
    throw new AppError("Unable to update company status", 500);
  }

  logger.info(`Company status updated to '${status}': '${data.name}' (${data.id})`);
  return data;
}

/**
 * Enforces business rule: Companies must never be hard-deleted.
 *
 * @throws {MethodNotAllowedError} Always throws to reject deletion
 */
function preventHardDelete() {
  throw new MethodNotAllowedError(
    "Companies cannot be hard deleted. Deactivate the company by setting status to 'inactive'."
  );
}

module.exports = {
  createCompany,
  getCompanyById,
  getCompanyBySlug,
  updateCompanySettings,
  updateCompanyStatus,
  preventHardDelete
};
