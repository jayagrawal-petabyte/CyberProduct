 
create table if not exists public.companies (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  status         public.record_status not null default 'active',
  settings       jsonb not null default '{}'::jsonb,  -- stale_after_minutes, default_grant_minutes, log_full_urls. NO SECRETS.
  policy_version integer not null default 1,          -- bumped by trigger on policy/resource change
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- =============================================================================
-- SECTION 4. DEPARTMENTS AND PROFILES
-- =============================================================================
-- Table 2 of 17: departments
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete restrict,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint departments_company_name_key   unique (company_id, name),
  constraint departments_company_id_id_key  unique (company_id, id)   -- FK target for tenant-safe references [R-01]
);

-- Table 3 of 17: profiles (extends auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  company_id    uuid not null references public.companies (id) on delete restrict,
  employee_code text,
  full_name     text not null,
  email         text not null unique,
  role          public.app_role not null default 'employee',
  department_id uuid,
  manager_id    uuid,
  job_title     text,
  status        public.user_status not null default 'active',
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_company_employee_code_key unique (company_id, employee_code),
  constraint profiles_company_id_id_key         unique (company_id, id),
  constraint profiles_no_self_manager           check (manager_id is null or manager_id <> id),
  constraint profiles_department_fk foreign key (company_id, department_id)
    references public.departments (company_id, id) on delete set null (department_id),
  constraint profiles_manager_fk    foreign key (company_id, manager_id)
    references public.profiles (company_id, id)    on delete set null (manager_id)
);

-- =============================================================================
-- SECTION 5. DEVICE MANAGEMENT TABLES
-- =============================================================================
-- Table 5 of 17: devices
create table if not exists public.devices (
  id                       uuid primary key default gen_random_uuid(),
  company_id               uuid not null references public.companies (id) on delete restrict,
  owner_id                 uuid not null,
  device_name              text not null,
  device_type              public.device_type not null,
  os_name                  text,
  os_version               text,
  hardware_id              text not null,
  mac_address              macaddr,
  status                   public.device_status not null default 'pending',
  compliance_status        public.compliance_status not null default 'unknown',
  last_seen_at             timestamptz,
  last_compliance_check_at timestamptz,
  approved_by              uuid,
  approved_at              timestamptz,
  revoked_by               uuid,
  revoked_at               timestamptz,
  revoke_reason            text,
  registered_by            uuid not null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  -- The doc says both "hardware_id ... Unique" (column note) and
  -- "Unique: (company_id, hardware_id)" (rules). The per-company form is used. [A-12]
  constraint devices_company_hardware_key  unique (company_id, hardware_id),
  constraint devices_company_id_id_key     unique (company_id, id),
  constraint devices_owner_fk         foreign key (company_id, owner_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint devices_registered_by_fk foreign key (company_id, registered_by)
    references public.profiles (company_id, id) on delete restrict,
  constraint devices_approved_by_fk   foreign key (company_id, approved_by)
    references public.profiles (company_id, id) on delete set null (approved_by),
  constraint devices_revoked_by_fk    foreign key (company_id, revoked_by)
    references public.profiles (company_id, id) on delete set null (revoked_by)
);

-- =============================================================================
-- SECTION 6. CORPORATE NETWORK TABLES
-- =============================================================================
-- Table 6 of 17: corporate_networks
create table if not exists public.corporate_networks (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete restrict,
  name          text not null,
  network_type  public.network_type not null,
  cidr          cidr,
  ssid          text,
  is_authorized boolean not null default true,   -- false = known unsafe network
  is_active     boolean not null default true,
  description   text,
  created_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint corporate_networks_company_name_key  unique (company_id, name),
  constraint corporate_networks_company_id_id_key unique (company_id, id),
  constraint corporate_networks_identifier_chk check (
    (network_type = 'ssid' and ssid is not null)
    or (network_type in ('cidr', 'vpn_gateway') and cidr is not null)
  ),
  constraint corporate_networks_created_by_fk foreign key (company_id, created_by)
    references public.profiles (company_id, id) on delete set null (created_by)
);

-- Table 7 of 17: device_network_checks (insert-only history)
create table if not exists public.device_network_checks (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete restrict,
  device_id     uuid not null,
  network_id    uuid,
  observed_ip   inet,
  observed_ssid text,
  result        public.compliance_status not null,
  reason_code   text not null,
  checked_at    timestamptz not null default now(),
  constraint device_network_checks_company_id_id_key unique (company_id, id),
  constraint device_network_checks_device_fk  foreign key (company_id, device_id)
    references public.devices (company_id, id) on delete cascade,
  constraint device_network_checks_network_fk foreign key (company_id, network_id)
    references public.corporate_networks (company_id, id) on delete set null (network_id)
);

-- =============================================================================
-- SECTION 7. RESOURCE CATEGORIES AND RESOURCES
-- =============================================================================
-- Table 8 of 17: resource_categories
create table if not exists public.resource_categories (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete restrict,
  name        text not null,
  description text,
  status      public.record_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint resource_categories_company_name_key  unique (company_id, name),
  constraint resource_categories_company_id_id_key unique (company_id, id)
);

-- Table 9 of 17: resources
create table if not exists public.resources (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete restrict,
  name          text not null,
  resource_type public.resource_type not null,
  identifier    text not null,
  category_id   uuid,
  description   text,
  sensitivity   public.sensitivity_level not null default 'medium',
  status        public.record_status not null default 'active',
  created_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint resources_company_type_identifier_key unique (company_id, resource_type, identifier),
  constraint resources_company_id_id_key           unique (company_id, id),
  constraint resources_category_fk   foreign key (company_id, category_id)
    references public.resource_categories (company_id, id) on delete set null (category_id),
  constraint resources_created_by_fk foreign key (company_id, created_by)
    references public.profiles (company_id, id) on delete set null (created_by)
);

-- =============================================================================
-- SECTION 8. POLICIES
-- =============================================================================
-- Table 10 of 17: policies (rules only; the access engine evaluates them)
create table if not exists public.policies (
  id                        uuid primary key default gen_random_uuid(),
  company_id                uuid not null references public.companies (id) on delete restrict,
  name                      text not null,
  description               text,
  effect                    public.policy_effect not null,
  resource_id               uuid,
  category_id               uuid,
  applies_to_role           public.app_role,           -- null = all roles
  applies_to_department_id  uuid,                      -- null = all departments
  require_authorized_network boolean not null default true,
  require_compliant_device   boolean not null default true,
  max_grant_minutes         integer,
  priority                  integer not null default 100,
  extra_conditions          jsonb not null default '{}'::jsonb,
  status                    public.policy_status not null default 'draft',
  version                   integer not null default 1,
  created_by                uuid,
  updated_by                uuid,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint policies_company_name_key        unique (company_id, name),
  constraint policies_company_id_id_key       unique (company_id, id),
  constraint policies_single_target_chk       check (num_nonnulls(resource_id, category_id) <= 1),
  constraint policies_max_grant_chk           check (max_grant_minutes is null or max_grant_minutes > 0),
  constraint policies_resource_fk   foreign key (company_id, resource_id)
    references public.resources (company_id, id) on delete cascade,
  constraint policies_category_fk   foreign key (company_id, category_id)
    references public.resource_categories (company_id, id) on delete cascade,
  constraint policies_department_fk foreign key (company_id, applies_to_department_id)
    references public.departments (company_id, id) on delete cascade,
  constraint policies_created_by_fk foreign key (company_id, created_by)
    references public.profiles (company_id, id) on delete set null (created_by),
  constraint policies_updated_by_fk foreign key (company_id, updated_by)
    references public.profiles (company_id, id) on delete set null (updated_by)
);

-- =============================================================================
-- SECTION 9. ACCESS REQUESTS AND APPROVAL DELEGATIONS
-- =============================================================================
-- Table 4 of 17: approval_delegations (backup approver)
create table if not exists public.approval_delegations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete restrict,
  lead_id     uuid not null,
  delegate_id uuid not null,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz not null,
  reason      text,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  constraint approval_delegations_window_chk   check (ends_at > starts_at),
  constraint approval_delegations_distinct_chk check (lead_id <> delegate_id),
  constraint approval_delegations_lead_fk       foreign key (company_id, lead_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint approval_delegations_delegate_fk   foreign key (company_id, delegate_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint approval_delegations_created_by_fk foreign key (company_id, created_by)
    references public.profiles (company_id, id) on delete set null (created_by)
);

-- Table 11 of 17: access_requests
create table if not exists public.access_requests (
  id                         uuid primary key default gen_random_uuid(),
  company_id                 uuid not null references public.companies (id) on delete restrict,
  requester_id               uuid not null,
  resource_id                uuid not null,
  device_id                  uuid,
  reason                     text not null,
  requested_duration_minutes integer,
  status                     public.request_status not null default 'pending',
  assigned_lead_id           uuid,
  decided_by                 uuid,
  decided_at                 timestamptz,
  decision_reason            text,
  decided_on_behalf_of       uuid,
  decision_due_at            timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint access_requests_company_id_id_key unique (company_id, id),
  constraint access_requests_duration_chk check (requested_duration_minutes is null or requested_duration_minutes > 0),
  constraint access_requests_decision_chk check (
    (status in ('approved', 'rejected')) = (decided_by is not null and decided_at is not null)
  ),
  constraint access_requests_no_self_approval_chk check (decided_by is null or decided_by <> requester_id),
  constraint access_requests_requester_fk  foreign key (company_id, requester_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint access_requests_resource_fk   foreign key (company_id, resource_id)
    references public.resources (company_id, id) on delete restrict,
  constraint access_requests_device_fk     foreign key (company_id, device_id)
    references public.devices (company_id, id) on delete set null (device_id),
  constraint access_requests_assigned_fk   foreign key (company_id, assigned_lead_id)
    references public.profiles (company_id, id) on delete set null (assigned_lead_id),
  constraint access_requests_decided_by_fk foreign key (company_id, decided_by)
    references public.profiles (company_id, id) on delete set null (decided_by),
  constraint access_requests_on_behalf_fk  foreign key (company_id, decided_on_behalf_of)
    references public.profiles (company_id, id) on delete set null (decided_on_behalf_of)
);

-- Duplicate pending requests: one pending request per (requester, resource).
create unique index if not exists access_requests_one_pending_uidx
  on public.access_requests (requester_id, resource_id)
  where status = 'pending';

-- =============================================================================
-- SECTION 10. ACCESS GRANTS
-- =============================================================================
-- Table 12 of 17: access_grants (exactly one per approved request)
create table if not exists public.access_grants (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete restrict,
  request_id    uuid not null,
  user_id       uuid not null,
  resource_id   uuid not null,
  device_id     uuid,
  granted_by    uuid not null,
  starts_at     timestamptz not null default now(),
  expires_at    timestamptz,                    -- null = no expiry (only where policy allows)
  status        public.grant_status not null default 'active',
  revoked_by    uuid,
  revoked_at    timestamptz,
  revoke_reason text,
  created_at    timestamptz not null default now(),
  constraint access_grants_request_id_key     unique (request_id),
  constraint access_grants_company_id_id_key  unique (company_id, id),
  constraint access_grants_window_chk check (expires_at is null or expires_at > starts_at),
  constraint access_grants_request_fk    foreign key (company_id, request_id)
    references public.access_requests (company_id, id) on delete restrict,
  constraint access_grants_user_fk       foreign key (company_id, user_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint access_grants_resource_fk   foreign key (company_id, resource_id)
    references public.resources (company_id, id) on delete restrict,
  constraint access_grants_device_fk     foreign key (company_id, device_id)
    references public.devices (company_id, id) on delete set null (device_id),
  constraint access_grants_granted_by_fk foreign key (company_id, granted_by)
    references public.profiles (company_id, id) on delete restrict,
  constraint access_grants_revoked_by_fk foreign key (company_id, revoked_by)
    references public.profiles (company_id, id) on delete set null (revoked_by)
);

-- =============================================================================
-- SECTION 11. ACCESS DECISIONS (insert-only)
-- =============================================================================
-- Table 13 of 17: access_decisions
create table if not exists public.access_decisions (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies (id) on delete restrict,
  user_id           uuid not null,
  device_id         uuid,
  resource_id       uuid,
  target_identifier text not null,              -- domain / app id only, not full URL
  network_check_id  uuid,
  policy_id         uuid,
  grant_id          uuid,
  request_id        uuid,
  decision          public.decision_outcome not null,
  reason_code       text not null,
  source_ip         inet,
  context           jsonb not null default '{}'::jsonb,
  decided_at        timestamptz not null default now(),
  constraint access_decisions_company_id_id_key unique (company_id, id),
  constraint access_decisions_user_fk          foreign key (company_id, user_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint access_decisions_device_fk        foreign key (company_id, device_id)
    references public.devices (company_id, id) on delete set null (device_id),
  constraint access_decisions_resource_fk      foreign key (company_id, resource_id)
    references public.resources (company_id, id) on delete set null (resource_id),
  constraint access_decisions_network_check_fk foreign key (company_id, network_check_id)
    references public.device_network_checks (company_id, id) on delete set null (network_check_id),
  constraint access_decisions_policy_fk        foreign key (company_id, policy_id)
    references public.policies (company_id, id) on delete set null (policy_id),
  constraint access_decisions_grant_fk         foreign key (company_id, grant_id)
    references public.access_grants (company_id, id) on delete set null (grant_id),
  constraint access_decisions_request_fk       foreign key (company_id, request_id)
    references public.access_requests (company_id, id) on delete set null (request_id)
);

-- =============================================================================
-- SECTION 12. ACCESS SESSIONS
-- =============================================================================
-- Table 14 of 17: access_sessions
create table if not exists public.access_sessions (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies (id) on delete restrict,
  user_id          uuid not null,
  device_id        uuid,
  resource_id      uuid,
  grant_id         uuid,
  decision_id      uuid,
  status           public.session_status not null default 'active',
  started_at       timestamptz not null default now(),
  last_activity_at timestamptz,
  ended_at         timestamptz,
  end_reason       public.session_end_reason,
  constraint access_sessions_end_chk check ((status = 'ended') = (ended_at is not null)),
  constraint access_sessions_user_fk     foreign key (company_id, user_id)
    references public.profiles (company_id, id) on delete restrict,
  constraint access_sessions_device_fk   foreign key (company_id, device_id)
    references public.devices (company_id, id) on delete set null (device_id),
  constraint access_sessions_resource_fk foreign key (company_id, resource_id)
    references public.resources (company_id, id) on delete set null (resource_id),
  constraint access_sessions_grant_fk    foreign key (company_id, grant_id)
    references public.access_grants (company_id, id) on delete set null (grant_id),
  constraint access_sessions_decision_fk foreign key (company_id, decision_id)
    references public.access_decisions (company_id, id) on delete set null (decision_id)
);

-- =============================================================================
-- SECTION 13. AUDIT LOGS (append-only, hash-chained)
-- =============================================================================
-- Table 15 of 17: audit_logs
-- id is GENERATED ALWAYS so no client can choose an id. The chain trigger also
-- overwrites id, created_at, prev_hash and entry_hash (see section 18/19).
-- actor_id is deliberately a plain uuid with NO foreign key (per the document)
-- so history survives user changes.
create table if not exists public.audit_logs (
  id          bigint generated always as identity primary key,
  company_id  uuid not null references public.companies (id) on delete restrict,
  event_type  text not null,
  actor_id    uuid,
  actor_role  public.app_role,
  target_type text,
  target_id   uuid,
  outcome     public.audit_outcome not null,
  reason_code text,
  ip_address  inet,
  metadata    jsonb not null default '{}'::jsonb,
  prev_hash   text,
  entry_hash  text not null,
  created_at  timestamptz not null default now(),
  constraint audit_logs_company_id_id_key unique (company_id, id)   -- FK target for alerts [R-01]
);

-- =============================================================================
-- SECTION 14. ALERTS
-- =============================================================================
-- Table 16 of 17: alerts
create table if not exists public.alerts (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies (id) on delete restrict,
  alert_type      public.alert_type not null,
  severity        public.alert_severity not null,
  status          public.alert_status not null default 'open',
  title           text not null,
  description     text,
  user_id         uuid,
  device_id       uuid,
  resource_id     uuid,
  decision_id     uuid,
  audit_log_id    bigint,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_by     uuid,
  resolved_at     timestamptz,
  resolution_note text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint alerts_user_fk      foreign key (company_id, user_id)
    references public.profiles (company_id, id) on delete set null (user_id),
  constraint alerts_device_fk    foreign key (company_id, device_id)
    references public.devices (company_id, id) on delete set null (device_id),
  constraint alerts_resource_fk  foreign key (company_id, resource_id)
    references public.resources (company_id, id) on delete set null (resource_id),
  constraint alerts_decision_fk  foreign key (company_id, decision_id)
    references public.access_decisions (company_id, id) on delete set null (decision_id),
  -- document: "nullable FK -> audit_logs.id" with no ON DELETE => NO ACTION (audit rows are never deleted)
  constraint alerts_audit_log_fk foreign key (company_id, audit_log_id)
    references public.audit_logs (company_id, id),
  constraint alerts_ack_by_fk    foreign key (company_id, acknowledged_by)
    references public.profiles (company_id, id) on delete set null (acknowledged_by),
  constraint alerts_resolved_by_fk foreign key (company_id, resolved_by)
    references public.profiles (company_id, id) on delete set null (resolved_by)
);

-- =============================================================================
-- SECTION 15. NOTIFICATIONS (outbox)
-- =============================================================================
-- Table 17 of 17: notifications. No secrets (Slack webhooks, SMTP creds) here.
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id) on delete restrict,
  recipient_id uuid not null,
  channel      public.notification_channel not null,
  event_type   text not null,
  title        text not null,
  body         text,
  related_type text,
  related_id   uuid,
  status       public.notification_status not null default 'pending',
  attempts     integer not null default 0,
  last_error   text,
  sent_at      timestamptz,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  constraint notifications_recipient_fk foreign key (company_id, recipient_id)
    references public.profiles (company_id, id) on delete cascade
);

-- =============================================================================
-- SECTION 16. CONSTRAINTS ADDED AFTER ALL TABLES EXIST
-- =============================================================================
-- Circular dependencies: NONE exist in this schema (checked table by table), so
-- no foreign key needs DEFERRABLE / late creation. Every FK is declared inline.
-- This section holds the extra consistency CHECKs recommended by the analysis.
-- Each is independent and can be dropped without affecting the others.
-- They are added through a guarded loop so re-running the file is harmless.
do $$
declare
  c record;
begin
  for c in
    select * from (values
      -- [R-10] counters / versions must be sane
      ('companies',     'companies_policy_version_chk',  'check (policy_version >= 1)'),
      ('policies',      'policies_version_chk',          'check (version >= 1)'),
      ('notifications', 'notifications_attempts_chk',    'check (attempts >= 0)'),
      -- [R-11] jsonb columns must be objects (documented as option bags)
      ('companies',     'companies_settings_object_chk', 'check (jsonb_typeof(settings) = ''object'')'),
      ('policies',      'policies_extra_conditions_object_chk', 'check (jsonb_typeof(extra_conditions) = ''object'')'),
      -- [R-12] lifecycle columns must agree with status (revoked_by is excluded on
      --        purpose: it is ON DELETE SET NULL and must be allowed to become null)
      ('devices',       'devices_revoked_chk',           'check ((status = ''revoked'') = (revoked_at is not null))'),
      ('access_grants', 'access_grants_revoked_chk',     'check ((status = ''revoked'') = (revoked_at is not null))'),
      ('alerts',        'alerts_resolved_chk',           'check ((status = ''resolved'') = (resolved_at is not null))')
    ) as v(tbl, cname, def)
  loop
    if not exists (
      select 1 from pg_constraint
      where conname = c.cname and conrelid = format('public.%I', c.tbl)::regclass
    ) then
      execute format('alter table public.%I add constraint %I %s', c.tbl, c.cname, c.def);
    end if;
  end loop;
end
$$;

-- =============================================================================
-- SECTION 17. INDEXES
-- =============================================================================
-- PK / UNIQUE constraints already create indexes; none are duplicated here.
-- Partial indexes only use immutable predicates (no now()).

-- profiles: lead/team lookups, department filters, role checks
create index if not exists profiles_company_manager_idx    on public.profiles (company_id, manager_id);
create index if not exists profiles_company_department_idx on public.profiles (company_id, department_id);
create index if not exists profiles_company_role_idx       on public.profiles (company_id, role) where status = 'active';

-- approval_delegations: "is there an active delegation for this lead right now?"
create index if not exists approval_delegations_lead_window_idx on public.approval_delegations (lead_id, ends_at);
create index if not exists approval_delegations_delegate_idx    on public.approval_delegations (delegate_id);

-- devices
create index if not exists devices_owner_idx          on public.devices (owner_id);
create index if not exists devices_company_status_idx on public.devices (company_id, status);

-- device_network_checks: latest result per device; retention purge by age
create index if not exists device_network_checks_device_time_idx  on public.device_network_checks (device_id, checked_at desc);
create index if not exists device_network_checks_company_time_idx on public.device_network_checks (company_id, checked_at);
create index if not exists device_network_checks_network_idx      on public.device_network_checks (network_id) where network_id is not null;

-- resources: filters + trigram search endpoint (I2-05)
create index if not exists resources_company_category_idx on public.resources (company_id, category_id);
create index if not exists resources_company_status_idx   on public.resources (company_id, status);
create index if not exists resources_name_trgm_idx        on public.resources using gin (name extensions.gin_trgm_ops);
create index if not exists resources_identifier_trgm_idx  on public.resources using gin (identifier extensions.gin_trgm_ops);

-- policies: engine loads active policies per company; target lookups
create index if not exists policies_company_status_idx   on public.policies (company_id, status);
create index if not exists policies_resource_idx         on public.policies (resource_id)  where resource_id is not null;
create index if not exists policies_category_idx         on public.policies (category_id)  where category_id is not null;
create index if not exists policies_department_idx       on public.policies (applies_to_department_id) where applies_to_department_id is not null;

-- access_requests: approver inbox, my requests, timeout job
create index if not exists access_requests_assigned_idx   on public.access_requests (assigned_lead_id, status);
create index if not exists access_requests_requester_idx  on public.access_requests (requester_id, created_at desc);
create index if not exists access_requests_resource_idx   on public.access_requests (resource_id);
create index if not exists access_requests_device_idx     on public.access_requests (device_id) where device_id is not null;
create index if not exists access_requests_due_idx        on public.access_requests (decision_due_at) where status = 'pending' and decision_due_at is not null;
-- (the partial UNIQUE index access_requests_one_pending_uidx is created with the table)

-- access_grants: "does this user hold an active grant for this resource?", expiry job
create index if not exists access_grants_user_resource_idx on public.access_grants (user_id, resource_id) where status = 'active';
create index if not exists access_grants_expiry_idx        on public.access_grants (expires_at) where status = 'active' and expires_at is not null;
create index if not exists access_grants_device_idx        on public.access_grants (device_id) where device_id is not null;
create index if not exists access_grants_resource_idx      on public.access_grants (resource_id);

-- access_decisions: dashboards (blocked attempts), per-user review
create index if not exists access_decisions_company_time_idx  on public.access_decisions (company_id, decided_at desc);
create index if not exists access_decisions_user_time_idx     on public.access_decisions (user_id, decided_at desc);
create index if not exists access_decisions_outcome_time_idx  on public.access_decisions (company_id, decision, decided_at desc);
create index if not exists access_decisions_resource_idx      on public.access_decisions (resource_id)  where resource_id is not null;
create index if not exists access_decisions_device_idx        on public.access_decisions (device_id)    where device_id is not null;
create index if not exists access_decisions_grant_idx         on public.access_decisions (grant_id)     where grant_id is not null;
create index if not exists access_decisions_request_idx       on public.access_decisions (request_id)   where request_id is not null;

-- access_sessions: termination fan-out when a grant/device/user is revoked
create index if not exists access_sessions_active_grant_idx  on public.access_sessions (grant_id)  where status = 'active' and grant_id is not null;
create index if not exists access_sessions_active_device_idx on public.access_sessions (device_id) where status = 'active' and device_id is not null;
create index if not exists access_sessions_active_user_idx   on public.access_sessions (user_id)   where status = 'active';

-- audit_logs: keyset pagination on (created_at, id); filters; chain lookup uses (company_id, id) UNIQUE
create index if not exists audit_logs_company_time_idx   on public.audit_logs (company_id, created_at desc, id desc);
create index if not exists audit_logs_company_event_idx  on public.audit_logs (company_id, event_type, created_at desc);
create index if not exists audit_logs_target_idx         on public.audit_logs (company_id, target_type, target_id);

-- alerts: dashboard counts by type/status
create index if not exists alerts_company_status_idx on public.alerts (company_id, status, created_at desc);
create index if not exists alerts_company_type_idx   on public.alerts (company_id, alert_type, created_at desc);
create index if not exists alerts_user_idx           on public.alerts (user_id)     where user_id is not null;
create index if not exists alerts_decision_idx       on public.alerts (decision_id) where decision_id is not null;
create index if not exists alerts_audit_log_idx      on public.alerts (audit_log_id) where audit_log_id is not null;

-- notifications: unread inbox; delivery worker queue
create index if not exists notifications_recipient_unread_idx on public.notifications (recipient_id, created_at desc) where read_at is null;
create index if not exists notifications_recipient_time_idx   on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_worker_queue_idx     on public.notifications (created_at) where status in ('pending', 'failed');

-- =============================================================================
-- SECTION 18. DATABASE FUNCTIONS
-- =============================================================================
-- CONVENTIONS
--  * All helpers live in schema `private` (not exposed through the API).
--  * SECURITY DEFINER is used ONLY where a function must read or write rows the
--    calling API role cannot (profiles lookups for RLS, audit/notification
--    writes, session termination). Every such function sets search_path = ''
--    and schema-qualifies every object, so it cannot be hijacked through a
--    malicious schema on the search path.
--  * Guard triggers that must tell "API caller" from "trusted backend" are
--    SECURITY INVOKER, because inside a SECURITY DEFINER function current_user
--    is the function owner. They call small DEFINER helpers for any lookups.
--  * "API caller" = current_user is anon or authenticated (i.e. a request that
--    arrived through PostgREST with a user JWT). service_role, postgres and
--    pg_cron are "trusted" and skip the API-only guards. Universal invariants
--    (state machines, CHECKs, tenant FKs) apply to EVERYONE.

-- ---- 18.1 generic helpers ---------------------------------------------------
-- Maintains updated_at (the document's set_updated_at()). Always overwrites any
-- client-supplied value.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- True when the statement comes from a user-facing API role.
create or replace function private.is_api_caller()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('anon', 'authenticated');
$$;

-- Names of columns whose value differs between two row images (updated_at ignored).
create or replace function private.changed_columns(p_old jsonb, p_new jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(n.key order by n.key), '{}'::text[])
  from jsonb_each(p_new) as n
  where n.key <> 'updated_at'
    and (p_old -> n.key) is distinct from n.value;
$$;

-- ---- 18.2 trusted identity helpers (used by RLS) ---------------------------
-- The caller's tenant, derived ONLY from public.profiles (never from the JWT
-- body, never from request payloads). Returns NULL (=> every policy fails
-- closed) when the user has no profile, is suspended/deactivated, or the
-- company is inactive.                                            [ASSUMPTION A-13: inactive company locks out its users]
create or replace function private.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.company_id
  from public.profiles p
  join public.companies c on c.id = p.company_id
  where p.id = auth.uid()
    and p.status = 'active'
    and c.status = 'active';
$$;

create or replace function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  join public.companies c on c.id = p.company_id
  where p.id = auth.uid()
    and p.status = 'active'
    and c.status = 'active';
$$;

create or replace function private.is_security_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() = 'security_admin', false);
$$;

create or replace function private.is_lead()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() = 'lead', false);
$$;

-- "Own team" = the caller is a LEAD and the target's manager_id is the caller.
-- The role check stops a non-lead who was mistakenly set as someone's manager
-- from gaining team visibility.
create or replace function private.is_team_member(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() = 'lead', false)
     and exists (
       select 1
       from public.profiles t
       where t.id = p_user_id
         and t.manager_id = auth.uid()
         and t.company_id = private.current_company_id()
     );
$$;

-- Own record, own team (lead) or any record in the company (security_admin).
-- Callers still add `company_id = current_company_id()` in the policy.
create or replace function private.can_view_user_records(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and p_user_id is not null
     and ( p_user_id = auth.uid()
           or private.is_team_member(p_user_id)
           or private.is_security_admin() );
$$;

-- Owner of a device in the caller's company (NULL otherwise).
create or replace function private.device_owner_id(p_device_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select d.owner_id
  from public.devices d
  where d.id = p_device_id
    and d.company_id = private.current_company_id();
$$;

-- Whole-row profile lookup for guard triggers (bypasses RLS on purpose). For an API caller it only
-- sees their OWN company (defence in depth); trusted callers (no API identity) see everything.
create or replace function private.get_profile(p_id uuid)
returns public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select p from public.profiles p
  where p.id = p_id
    and (private.current_company_id() is null or p.company_id = private.current_company_id());
$$;

-- ---- 18.3 tenant / identity stamping triggers ------------------------------
-- company_id is taken from the session, never from the payload.
create or replace function private.set_company_from_session()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_api_caller() then
    new.company_id := private.current_company_id();
    if new.company_id is null then
      raise exception 'No active profile for the current session' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- company_id can never be changed after insert, by anyone.
create or replace function private.forbid_company_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.company_id is distinct from old.company_id then
    raise exception 'company_id is immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- created_by comes from the session for API callers.
create or replace function private.stamp_created_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_api_caller() then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

-- ---- 18.4 Supabase Auth -> profiles ----------------------------------------
-- Creates a profile when an auth user is created, but ONLY when a trusted
-- company_id is present in raw_app_meta_data. raw_app_meta_data can be written
-- only by the service role / Auth admin API; it CANNOT be set by a user through
-- signUp() or updateUser() (those write raw_user_meta_data). Therefore:
--   * a self-registered user gets NO profile => no company => RLS denies everything
--   * the role is ALWAYS 'employee' here; promotion is done by a security_admin
--     or the backend afterwards. A role in any metadata is ignored.
--   * full_name is display-only and is read from user metadata (harmless).
-- The function never raises, so a profile problem can never block sign-up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company uuid;
  v_name    text;
begin
  if new.email is null then
    return new;
  end if;

  begin
    v_company := nullif(new.raw_app_meta_data ->> 'company_id', '')::uuid;
  exception when others then
    v_company := null;
  end;

  if v_company is null
     or not exists (select 1 from public.companies c where c.id = v_company and c.status = 'active') then
    return new;   -- no trusted company assignment: leave the user without a profile
  end if;

  v_name := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1));

  insert into public.profiles (id, company_id, full_name, email)   -- role defaults to 'employee'
  values (new.id, v_company, left(v_name, 200), lower(new.email))
  on conflict (id) do nothing;

  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

-- Keeps the copied email and last_login_at in sync. Never raises.
create or replace function private.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.profiles set email = lower(new.email) where id = new.id;
  end if;
  if new.last_sign_in_at is distinct from old.last_sign_in_at then
    update public.profiles set last_login_at = new.last_sign_in_at where id = new.id;
  end if;
  return new;
exception when others then
  raise warning 'handle_auth_user_updated failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

 
create or replace function private.profiles_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_role    public.app_role;
  v_changed text[];
  v_allowed text[];
begin
  if not private.is_api_caller() then
    return new;
  end if;

  v_role := private.current_app_role();
  if v_uid is null or v_role is null then
    raise exception 'No active profile for the current session' using errcode = '42501';
  end if;

  v_changed := private.changed_columns(to_jsonb(old), to_jsonb(new));

  if v_role = 'security_admin' and old.id <> v_uid then
    v_allowed := array['full_name', 'employee_code', 'role', 'department_id', 'manager_id', 'job_title', 'status'];
  elsif old.id = v_uid then
    v_allowed := case when v_role = 'security_admin'
                      then array['full_name', 'employee_code', 'job_title', 'department_id', 'manager_id']
                      else array['full_name'] end;
  else
    raise exception 'Not permitted to modify this profile' using errcode = '42501';
  end if;

  if not (v_changed <@ v_allowed) then
    raise exception 'profiles: column(s) [%] cannot be modified through the API',
      array_to_string(array(select unnest(v_changed) except select unnest(v_allowed)), ', ')
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- companies: through the API only `settings` may change (policy_version is owned by triggers).
create or replace function private.companies_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_changed text[];
begin
  if not private.is_api_caller() then
    return new;
  end if;
  v_changed := private.changed_columns(to_jsonb(old), to_jsonb(new));
  if not (v_changed <@ array['settings']) then
    raise exception 'companies: only settings can be modified through the API' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- policies: version +1 on every real edit, updated_by/created_by from the session.
create or replace function private.policies_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.version := 1;
    if private.is_api_caller() then
      new.created_by := auth.uid();
      new.updated_by := auth.uid();
    end if;
    return new;
  end if;

  -- UPDATE: ignore the bookkeeping columns when deciding whether anything changed
  if private.changed_columns(to_jsonb(old) - 'version' - 'updated_by',
                             to_jsonb(new) - 'version' - 'updated_by') = '{}'::text[] then
    new.version    := old.version;
    new.updated_by := old.updated_by;
    return new;
  end if;
  new.version := old.version + 1;
  if private.is_api_caller() then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

-- devices: employees register their own device as 'pending'; security admins approve/revoke.
-- Status lifecycle (document: register -> approve -> revoke):  pending->active, pending->revoked,
-- active->revoked. 'revoked' is terminal for API callers.            [ASSUMPTION A-14]
-- compliance_status / last_*_at are system-owned (copied from device_network_checks).
create or replace function private.devices_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_role    public.app_role;
  v_changed text[];
begin
  if not private.is_api_caller() then
    return new;
  end if;

  v_role := private.current_app_role();
  if v_uid is null or v_role is null then
    raise exception 'No active profile for the current session' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.registered_by            := v_uid;
    new.status                   := 'pending';
    new.compliance_status        := 'unknown';
    new.last_seen_at             := null;
    new.last_compliance_check_at := null;
    new.approved_by := null; new.approved_at := null;
    new.revoked_by  := null; new.revoked_at  := null; new.revoke_reason := null;
    if v_role <> 'security_admin' then
      new.owner_id := v_uid;                 -- employees/leads can only register their own devices
    end if;
    return new;
  end if;

  -- UPDATE
  if v_role <> 'security_admin' then
    raise exception 'Only a security administrator can modify devices' using errcode = '42501';
  end if;

  v_changed := private.changed_columns(to_jsonb(old), to_jsonb(new));
  if not (v_changed <@ array['device_name', 'device_type', 'os_name', 'os_version', 'mac_address', 'status', 'revoke_reason']) then
    raise exception 'devices: column(s) [%] cannot be modified through the API',
      array_to_string(array(select unnest(v_changed) except
        select unnest(array['device_name', 'device_type', 'os_name', 'os_version', 'mac_address', 'status', 'revoke_reason'])), ', ')
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not ((old.status = 'pending' and new.status in ('active', 'revoked'))
         or (old.status = 'active'  and new.status = 'revoked')) then
      raise exception 'Invalid device status transition % -> %', old.status, new.status using errcode = '23514';
    end if;
    if new.status = 'active' then
      new.approved_by := v_uid;  new.approved_at := now();
    else
      new.revoked_by  := v_uid;  new.revoked_at  := now();
    end if;
  elsif new.revoke_reason is distinct from old.revoke_reason and new.status <> 'revoked' then
    raise exception 'revoke_reason can only be set on a revoked device' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- Approver resolution (document, approval_delegations notes): requester's lead; if an
-- active delegation covers now(), the delegate; otherwise NULL (the backend escalates to a
-- security_admin - which admin is an open PRD question).
create or replace function private.resolve_approver(p_requester_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    ( select d.delegate_id
      from public.approval_delegations d
      join public.profiles dp on dp.id = d.delegate_id
      where d.lead_id = p.manager_id
        and d.company_id = p.company_id
        and d.delegate_id <> p.id
        and now() >= d.starts_at and now() < d.ends_at
        and dp.status = 'active'
        and dp.role in ('lead', 'security_admin')
      order by d.created_at desc
      limit 1 ),
    p.manager_id)
  from public.profiles p
  where p.id = p_requester_id;
$$;

-- Resource must be active and device (if given) must belong to the requester.
create or replace function private.request_refs_valid(p_resource_id uuid, p_device_id uuid, p_requester_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
           select 1
           from public.resources r
           join public.profiles p on p.company_id = r.company_id
           where r.id = p_resource_id and r.status = 'active' and p.id = p_requester_id)
     and ( p_device_id is null
           or exists (select 1 from public.devices d
                      where d.id = p_device_id and d.owner_id = p_requester_id));
$$;

create or replace function private.get_request(p_id uuid)
returns public.access_requests
language sql
stable
security definer
set search_path = ''
as $$
  select r from public.access_requests r
  where r.id = p_id
    and (private.current_company_id() is null or r.company_id = private.current_company_id());
$$;

-- access_requests: the single most security-sensitive guard.
--  INSERT (API): requester = caller, status = pending, no decision fields, no due date,
--                approver resolved by the database (client cannot pick their approver),
--                resource must be active, device must be the requester's own.
--  UPDATE (all callers): a finalised request cannot be changed (no double decision).
--  UPDATE (API): only status + decision_reason may be sent. The requester may cancel while
--                pending. The ASSIGNED approver (lead, or security_admin for escalations)
--                may approve/reject; never their own request. decided_by/decided_at/
--                decided_on_behalf_of are stamped here, not trusted from the payload.
--  'expired' is set only by the system job.
--  [CHANGE R-03] a security_admin may decide a request ASSIGNED to them (escalation target). The matrix
--  says "Read" only for admins, but the document's own escalation rule would otherwise be unusable.
--  [CHANGE R-04] the approver is resolved by the database because requesters insert straight through PostgREST.
create or replace function private.access_requests_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_role    public.app_role;
  v_changed text[];
  v_req     public.profiles;
begin
  if tg_op = 'INSERT' then
    if private.is_api_caller() then
      v_role := private.current_app_role();
      if v_uid is null or v_role is null then
        raise exception 'No active profile for the current session' using errcode = '42501';
      end if;
      new.requester_id          := v_uid;
      new.status                := 'pending';
      new.decided_by            := null;
      new.decided_at            := null;
      new.decision_reason       := null;
      new.decided_on_behalf_of  := null;
      new.decision_due_at       := null;   -- deadline policy is an open PRD question; set by the backend
      new.assigned_lead_id      := private.resolve_approver(v_uid);
      if not private.request_refs_valid(new.resource_id, new.device_id, v_uid) then
        raise exception 'Resource is not available or device does not belong to the requester' using errcode = '23514';
      end if;
    elsif new.assigned_lead_id is null then
      new.assigned_lead_id := private.resolve_approver(new.requester_id);
    end if;
    return new;
  end if;

  -- ---- UPDATE ----
  v_changed := private.changed_columns(to_jsonb(old), to_jsonb(new));

  if old.status <> 'pending' then          -- universal: finalised requests are frozen
    if v_changed && array['status', 'reason', 'requester_id', 'resource_id', 'requested_duration_minutes',
                          'decided_at', 'decision_reason'] then
      raise exception 'Access request is already % and can no longer be changed', old.status using errcode = '23514';
    end if;
    return new;
  end if;

  if not private.is_api_caller() then       -- trusted backend; CHECK constraints still apply
    return new;
  end if;

  v_role := private.current_app_role();
  if v_uid is null or v_role is null then
    raise exception 'No active profile for the current session' using errcode = '42501';
  end if;

  if not (v_changed <@ array['status', 'decision_reason', 'decided_by', 'decided_at', 'decided_on_behalf_of']) then
    raise exception 'access_requests: only status and decision_reason can be modified through the API' using errcode = '42501';
  end if;

  if new.status = old.status then
    if v_changed <> '{}'::text[] then
      raise exception 'decision_reason can only be written together with a decision' using errcode = '23514';
    end if;
    return new;
  end if;

  if new.status = 'cancelled' then
    if v_uid <> old.requester_id then
      raise exception 'Only the requester can cancel a request' using errcode = '42501';
    end if;
    new.decision_reason := old.decision_reason;
    new.decided_by := null; new.decided_at := null; new.decided_on_behalf_of := null;

  elsif new.status in ('approved', 'rejected') then
    if old.assigned_lead_id is distinct from v_uid or v_role not in ('lead', 'security_admin') then
      raise exception 'Only the assigned approver can decide this request' using errcode = '42501';
    end if;
    if v_uid = old.requester_id then
      raise exception 'You cannot decide your own request' using errcode = '42501';
    end if;
    new.decided_by := v_uid;
    new.decided_at := now();
    v_req := private.get_profile(old.requester_id);
    new.decided_on_behalf_of := case
      when v_req.manager_id is not null and v_req.manager_id <> v_uid then v_req.manager_id
      else null end;                         -- [ASSUMPTION A-15] delegate/escalated decisions record the requester's lead

  else
    raise exception 'Invalid status transition pending -> %', new.status using errcode = '23514';
  end if;
  return new;
end;
$$;

-- [CHANGE R-09] grant/session invariants enforced in the database (see also access_sessions_guard).
-- access_grants: grants are created by the backend only. Universal invariants:
-- a grant needs an APPROVED request, must match its requester/resource, and
-- granted_by must be the recorded approver. Status only moves active->expired|revoked.
-- Security admins may revoke through the API; revoked_by/at are stamped here.
create or replace function private.access_grants_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_req     public.access_requests;
  v_changed text[];
begin
  if tg_op = 'INSERT' then
    v_req := private.get_request(new.request_id);
    if v_req.id is null or v_req.status <> 'approved' then
      raise exception 'A grant requires an approved access request' using errcode = '23514';
    end if;
    if new.user_id <> v_req.requester_id or new.resource_id <> v_req.resource_id then
      raise exception 'Grant user/resource must match the approved request' using errcode = '23514';
    end if;
    if new.granted_by is distinct from v_req.decided_by then
      raise exception 'granted_by must be the approver recorded on the request' using errcode = '23514';
    end if;
    return new;
  end if;

  -- ---- UPDATE ----
  v_changed := private.changed_columns(to_jsonb(old), to_jsonb(new));
  if old.status <> 'active' and v_changed && array['status', 'starts_at', 'expires_at', 'user_id', 'resource_id', 'request_id'] then
    raise exception 'Grant is already % and can no longer be changed', old.status using errcode = '23514';
  end if;

  if not private.is_api_caller() then
    return new;
  end if;

  if v_uid is null or private.current_app_role() is distinct from 'security_admin' then
    raise exception 'Only a security administrator can revoke grants' using errcode = '42501';
  end if;
  if not (v_changed <@ array['status', 'revoke_reason', 'revoked_by', 'revoked_at']) then
    raise exception 'access_grants: only status and revoke_reason can be modified through the API' using errcode = '42501';
  end if;
  if new.status is distinct from old.status then
    if new.status <> 'revoked' then
      raise exception 'Grants can only be revoked through the API (expiry is a system job)' using errcode = '23514';
    end if;
    new.revoked_by := v_uid;
    new.revoked_at := now();
  elsif new.revoke_reason is distinct from old.revoke_reason and new.status <> 'revoked' then
    raise exception 'revoke_reason can only be set when revoking' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- approval_delegations: delegate must be an ACTIVE lead or security_admin (the document says
-- "enforced in the API"; it is enforced here as well because leads insert directly through
-- PostgREST). A lead can only delegate THEIR OWN approvals; created_by comes from the session.
create or replace function private.approval_delegations_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_role public.app_role;
  v_del  public.profiles;
begin
  v_del := private.get_profile(new.delegate_id);
  if v_del.id is null or v_del.status <> 'active' or v_del.role not in ('lead', 'security_admin') then
    raise exception 'Delegate must be an active lead or security_admin' using errcode = '23514';
  end if;

  if private.is_api_caller() then
    v_role := private.current_app_role();
    if v_uid is null or v_role is null then
      raise exception 'No active profile for the current session' using errcode = '42501';
    end if;
    new.created_by := v_uid;
    if v_role = 'lead' and new.lead_id <> v_uid then
      raise exception 'A lead can only delegate their own approvals' using errcode = '42501';
    elsif v_role not in ('lead', 'security_admin') then
      raise exception 'Only leads and security administrators can create delegations' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- alerts: security admins acknowledge/resolve. open->acknowledged, open->resolved,
-- acknowledged->resolved. A resolved alert is final.                 [ASSUMPTION A-16]
create or replace function private.alerts_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_changed text[];
begin
  v_changed := private.changed_columns(to_jsonb(old), to_jsonb(new));
  if old.status = 'resolved' and v_changed <> '{}'::text[] then
    raise exception 'Alert is already resolved and can no longer be changed' using errcode = '23514';
  end if;

  if not private.is_api_caller() then
    return new;
  end if;
  if v_uid is null or private.current_app_role() is distinct from 'security_admin' then
    raise exception 'Only a security administrator can update alerts' using errcode = '42501';
  end if;

  if not (v_changed <@ array['status', 'resolution_note', 'acknowledged_by', 'acknowledged_at', 'resolved_by', 'resolved_at']) then
    raise exception 'alerts: only status and resolution_note can be modified through the API' using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not ((old.status = 'open' and new.status in ('acknowledged', 'resolved'))
         or (old.status = 'acknowledged' and new.status = 'resolved')) then
      raise exception 'Invalid alert status transition % -> %', old.status, new.status using errcode = '23514';
    end if;
    if new.status = 'acknowledged' then
      new.acknowledged_by := v_uid;  new.acknowledged_at := now();
    else
      new.resolved_by := v_uid;      new.resolved_at := now();
    end if;
  end if;
  return new;
end;
$$;

-- notifications: a recipient may only mark their own notification as read; the timestamp is server-set.
create or replace function private.notifications_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_api_caller() then
    return new;
  end if;
  if not (private.changed_columns(to_jsonb(old), to_jsonb(new)) <@ array['read_at']) then
    raise exception 'notifications: only read_at can be modified through the API' using errcode = '42501';
  end if;
  new.read_at := coalesce(old.read_at, now());
  return new;
end;
$$;

-- access_sessions (SECURITY DEFINER, applies to EVERY caller incl. the backend).
-- Closes the race "revoke device/grant while the engine is opening a session":
-- the dependency rows are locked FOR SHARE, so a concurrent revoke either commits
-- first (insert is refused) or waits for the insert and then ends the new session.
-- An ended session can never be re-opened.
create or replace function private.access_sessions_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'active' then
      perform 1 from public.profiles p where p.id = new.user_id and p.status = 'active' for share;
      if not found then
        raise exception 'Cannot open a session for an inactive user' using errcode = '23514';
      end if;
      if new.device_id is not null then
        perform 1 from public.devices d where d.id = new.device_id and d.status <> 'revoked' for share;
        if not found then
          raise exception 'Cannot open a session on a revoked device' using errcode = '23514';
        end if;
      end if;
      if new.grant_id is not null then
        perform 1 from public.access_grants g
         where g.id = new.grant_id and g.status = 'active'
           and (g.expires_at is null or g.expires_at > now()) for share;
        if not found then
          raise exception 'Cannot open a session on an inactive or expired grant' using errcode = '23514';
        end if;
      end if;
    end if;
    return new;
  end if;

  if old.status = 'ended' and new.status <> 'ended' then
    raise exception 'An ended session cannot be re-opened' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- ---- 18.6 audit log: hash chain + append-only -------------------------------
-- Canonical SHA-256 over a JSON array (unambiguous encoding, no delimiter tricks).
create or replace function private.audit_compute_hash(p public.audit_logs)
returns text
language sql
stable
set search_path = ''
as $$
  select encode(
    sha256(convert_to(
      jsonb_build_array(
        'cp-audit-v1', p.id, p.company_id, p.event_type, p.actor_id, p.actor_role,
        p.target_type, p.target_id, p.outcome, p.reason_code, p.ip_address::text,
        p.metadata, p.prev_hash,
        to_char(p.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
      )::text, 'UTF8')),
    'hex');
$$;

-- [CHANGE R-14] chain is per company; id/created_at/hashes are trigger-owned; id is GENERATED ALWAYS.
-- Chain builder. CONCURRENCY: one chain PER COMPANY. A transaction-scoped advisory
-- lock serialises inserts for that company until the inserting transaction ends, then
-- the id is drawn AFTER the lock is held, so chain order == id order == commit order.
-- Consequence: keep transactions that write audit rows SHORT (write the audit row last),
-- otherwise other writers for the same company wait. The trigger overwrites id,
-- created_at, prev_hash and entry_hash, so callers cannot forge them.
create or replace function private.audit_logs_chain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prev text;
begin
  perform pg_advisory_xact_lock(hashtextextended('cp-audit-chain:' || new.company_id::text, 0));
  new.id         := nextval(pg_get_serial_sequence('public.audit_logs', 'id'));
  new.created_at := clock_timestamp();
  select a.entry_hash into v_prev
  from public.audit_logs a
  where a.company_id = new.company_id
  order by a.id desc
  limit 1;
  new.prev_hash  := v_prev;
  new.entry_hash := private.audit_compute_hash(new);
  return new;
end;
$$;

-- No UPDATE / DELETE / TRUNCATE for anyone, including service_role.
-- (The table OWNER can still disable this trigger: see the honesty note in the report.)
create or replace function private.audit_logs_block_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_logs is append-only (% is not allowed)', tg_op using errcode = '42501';
end;
$$;

-- Verification (backend / SQL editor only). Returns one row per broken entry; no rows = chain intact.
create or replace function public.verify_audit_chain(p_company_id uuid)
returns table (audit_id bigint, problem text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.problem
  from (
    select a.id,
           case
             when a.prev_hash is distinct from lag(a.entry_hash) over (order by a.id)
               then 'prev_hash does not match the previous entry_hash'
             when a.entry_hash is distinct from private.audit_compute_hash(a)
               then 'entry_hash does not match the row contents'
           end as problem
    from public.audit_logs a
    where a.company_id = p_company_id
  ) s
  where s.problem is not null
  order by s.id;
$$;

-- Single entry point used by the DB triggers below. Actor role is looked up at event time.
create or replace function private.write_audit(
  p_company_id  uuid,
  p_event_type  text,
  p_actor_id    uuid,
  p_target_type text,
  p_target_id   uuid,
  p_outcome     public.audit_outcome,
  p_reason_code text,
  p_metadata    jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  insert into public.audit_logs
    (company_id, event_type, actor_id, actor_role, target_type, target_id, outcome, reason_code, metadata, entry_hash)
  values
    (p_company_id, p_event_type, p_actor_id,
     (select p.role from public.profiles p where p.id = p_actor_id),
     p_target_type, p_target_id, p_outcome, p_reason_code, coalesce(p_metadata, '{}'::jsonb), '')
  returning id into v_id;
  return v_id;
end;
$$;

-- ---- 18.7 policy_version bump ----------------------------------------------
create or replace function private.bump_policy_version(p_company_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.companies set policy_version = policy_version + 1 where id = p_company_id;
$$;

-- [CHANGE R-13] resource_categories also bump policy_version (a category move changes policy matching).
-- AFTER INSERT/UPDATE/DELETE on policies, resources, resource_categories.
-- A no-op UPDATE does not bump. (Policies' own `version` column is handled in policies_stamp.)
create or replace function private.bump_policy_version_trg()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.bump_policy_version(old.company_id);
  elsif tg_op = 'UPDATE' then
    if private.changed_columns(to_jsonb(old), to_jsonb(new)) <> '{}'::text[] then
      perform private.bump_policy_version(new.company_id);
    end if;
  else
    perform private.bump_policy_version(new.company_id);
  end if;
  return null;
end;
$$;

-- ---- 18.8 audit triggers for changes users can make DIRECTLY through the API ----
-- [CHANGE R-04] database-written audit events and in-app notifications.
-- Because the RLS matrix lets security admins write policies/devices and leads decide
-- requests straight through PostgREST, the audit event must be written by the database
-- or it could be skipped. The backend should therefore NOT write these same events again;
-- it writes the events only it knows about (access.decision, alert-related, etc.).
create or replace function private.audit_policies()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.write_audit(new.company_id, 'policy.created', auth.uid(), 'policy', new.id, 'success', null,
      jsonb_build_object('before', null, 'after', to_jsonb(new)));
  elsif tg_op = 'UPDATE' then
    if new.version is distinct from old.version then      -- version only moves on a real change
      perform private.write_audit(new.company_id, 'policy.updated', auth.uid(), 'policy', new.id, 'success', null,
        jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new)));
    end if;
  else
    perform private.write_audit(old.company_id, 'policy.deleted', auth.uid(), 'policy', old.id, 'success', null,
      jsonb_build_object('before', to_jsonb(old), 'after', null));
  end if;
  return null;
end;
$$;

create or replace function private.audit_access_requests()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event text;
  v_actor uuid;
begin
  if tg_op = 'INSERT' then
    v_event := 'request.submitted';
    v_actor := coalesce(auth.uid(), new.requester_id);
  elsif new.status is distinct from old.status then
    v_event := 'request.' || new.status::text;           -- approved | rejected | cancelled | expired
    v_actor := case new.status
                 when 'cancelled' then coalesce(auth.uid(), new.requester_id)
                 when 'expired'   then auth.uid()         -- null = system job
                 else coalesce(auth.uid(), new.decided_by)
               end;
  else
    return null;
  end if;
  perform private.write_audit(new.company_id, v_event, v_actor, 'access_request', new.id, 'success', null,
    jsonb_build_object('requester_id', new.requester_id, 'resource_id', new.resource_id,
                       'assigned_lead_id', new.assigned_lead_id, 'decided_by', new.decided_by,
                       'decided_on_behalf_of', new.decided_on_behalf_of));
  return null;
end;
$$;

create or replace function private.audit_devices()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.write_audit(new.company_id, 'device.registered', coalesce(auth.uid(), new.registered_by),
      'device', new.id, 'success', null, jsonb_build_object('owner_id', new.owner_id));
  elsif new.status is distinct from old.status then
    perform private.write_audit(new.company_id,
      case new.status when 'active' then 'device.approved' when 'revoked' then 'device.revoked' else 'device.status_changed' end,
      coalesce(auth.uid(), new.revoked_by, new.approved_by), 'device', new.id, 'success', new.revoke_reason,
      jsonb_build_object('owner_id', new.owner_id, 'from', old.status, 'to', new.status));
  end if;
  return null;
end;
$$;

create or replace function private.audit_access_grants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.write_audit(new.company_id, 'grant.created', coalesce(auth.uid(), new.granted_by),
      'access_grant', new.id, 'success', null,
      jsonb_build_object('user_id', new.user_id, 'resource_id', new.resource_id,
                         'request_id', new.request_id, 'expires_at', new.expires_at));
  elsif new.status is distinct from old.status then
    perform private.write_audit(new.company_id, 'grant.' || new.status::text,
      case new.status when 'revoked' then coalesce(auth.uid(), new.revoked_by) else auth.uid() end,
      'access_grant', new.id, 'success', new.revoke_reason,
      jsonb_build_object('user_id', new.user_id, 'resource_id', new.resource_id));
  end if;
  return null;
end;
$$;

-- Privilege changes (role / status) are always audited.
create or replace function private.audit_profiles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    perform private.write_audit(new.company_id, 'user.role_changed', auth.uid(), 'user', new.id, 'success', null,
      jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  if new.status is distinct from old.status then
    perform private.write_audit(new.company_id, 'user.status_changed', auth.uid(), 'user', new.id, 'success', null,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return null;
end;
$$;

-- ---- 18.9 notification outbox (in-app rows only) ---------------------------
-- In-app rows are created in the SAME transaction as the business change. They are
-- marked 'sent' immediately (delivery = the INSERT, picked up by Supabase Realtime).
-- Email / Slack rows are the backend's job (which events/recipients is an open PRD
-- question). Text is deliberately generic: no resource names, no URLs. [ASSUMPTION A-17]
create or replace function private.enqueue_in_app_notification(
  p_company_id   uuid,
  p_recipient_id uuid,
  p_event_type   text,
  p_title        text,
  p_body         text,
  p_related_type text,
  p_related_id   uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications
    (company_id, recipient_id, channel, event_type, title, body, related_type, related_id, status, sent_at)
  values
    (p_company_id, p_recipient_id, 'in_app', p_event_type, p_title, p_body, p_related_type, p_related_id, 'sent', now());
$$;

create or replace function private.notify_access_requests()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.assigned_lead_id is not null and new.status = 'pending' then
      perform private.enqueue_in_app_notification(new.company_id, new.assigned_lead_id, 'request.submitted',
        'New access request', 'An access request is waiting for your decision.', 'access_request', new.id);
    end if;
  elsif new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    perform private.enqueue_in_app_notification(new.company_id, new.requester_id, 'request.decided',
      'Your access request was ' || new.status::text, 'Open the portal to see the decision.', 'access_request', new.id);
  end if;
  return null;
end;
$$;

create or replace function private.notify_alerts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in
    select p.id from public.profiles p
    where p.company_id = new.company_id and p.role = 'security_admin' and p.status = 'active'
  loop
    perform private.enqueue_in_app_notification(new.company_id, r.id, 'alert.created',
      'New security alert', format('A %s %s alert was raised.', new.severity, new.alert_type), 'alert', new.id);
  end loop;
  return null;
end;
$$;

-- ---- 18.10 revocation / expiry handling ------------------------------------
-- Ends active sessions. DEFINER because the API roles may not write sessions.
create or replace function private.end_active_sessions(
  p_column text, p_value uuid, p_reason public.session_end_reason
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  if p_column = 'grant_id' then
    update public.access_sessions set status = 'ended', ended_at = now(), end_reason = p_reason
    where grant_id = p_value and status = 'active';
  elsif p_column = 'device_id' then
    update public.access_sessions set status = 'ended', ended_at = now(), end_reason = p_reason
    where device_id = p_value and status = 'active';
  elsif p_column = 'user_id' then
    update public.access_sessions set status = 'ended', ended_at = now(), end_reason = p_reason
    where user_id = p_value and status = 'active';
  else
    raise exception 'unsupported column %', p_column;
  end if;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

create or replace function private.on_grant_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'active' and new.status in ('expired', 'revoked') then
    perform private.end_active_sessions('grant_id', new.id,
      case new.status when 'expired' then 'grant_expired' else 'grant_revoked' end::public.session_end_reason);
  end if;
  return null;
end;
$$;

create or replace function private.on_device_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'revoked' and old.status <> 'revoked' then
    perform private.end_active_sessions('device_id', new.id, 'device_revoked');
  end if;
  return null;
end;
$$;

create or replace function private.on_profile_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'active' and new.status <> 'active' then
    perform private.end_active_sessions('user_id', new.id, 'user_deactivated');
  end if;
  return null;
end;
$$;

-- [CHANGE R-08] compliance sync trigger (admins cannot set compliance through the API).
-- device_network_checks -> devices.compliance_status ("latest result copied for fast lookup").
-- Only a NEWER check overwrites. Admins cannot set compliance through the API, so this trigger
-- is the only writer besides the backend.
create or replace function private.sync_device_compliance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.devices d
     set compliance_status = new.result,
         last_compliance_check_at = new.checked_at
   where d.id = new.device_id
     and (d.last_compliance_check_at is null or d.last_compliance_check_at <= new.checked_at);
  return null;
end;
$$;

-- Jobs for the BACKEND or pg_cron. They are idempotent and safe to run every minute.
-- The engine must STILL check expires_at > now() on every decision (job may lag).
create or replace function public.expire_due_grants()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  update public.access_grants
     set status = 'expired'
   where status = 'active' and expires_at is not null and expires_at <= now();
  get diagnostics v_n = row_count;
  return v_n;                       -- triggers end the sessions and write grant.expired audit rows
end;
$$;

-- Document: "A scheduled job sets pending requests past decision_due_at to expired."
create or replace function public.expire_overdue_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  update public.access_requests
     set status = 'expired'
   where status = 'pending' and decision_due_at is not null and decision_due_at <= now();
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- =============================================================================
-- SECTION 19. DATABASE TRIGGERS
-- =============================================================================
-- PostgreSQL fires triggers on the same event in ALPHABETICAL order of their names,
-- so the numeric prefixes below define the order:
--   BEFORE INSERT : trg_00_set_company -> trg_10_guard -> trg_20_stamp
--   BEFORE UPDATE : trg_00_company_immutable -> trg_10_guard -> trg_20_stamp -> trg_90_set_updated_at
--   AFTER         : trg_50_* (audit / notify / bump / lifecycle)
-- All previous trg_* triggers on these tables are dropped first, so re-running is safe.
do $$
declare
  r record;
begin
  for r in
    select c.relname as tbl, t.tgname
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal and t.tgname like 'trg\_%'
  loop
    execute format('drop trigger if exists %I on public.%I', r.tgname, r.tbl);
  end loop;
end
$$;

-- 19.1 updated_at
do $$
declare t text;
begin
  foreach t in array array['companies','departments','profiles','devices','corporate_networks',
                           'resource_categories','resources','policies','access_requests','alerts']
  loop
    execute format('create trigger trg_90_set_updated_at before update on public.%I
                    for each row execute function private.set_updated_at()', t);
  end loop;
end
$$;

-- 19.2 company_id: taken from the session on insert, immutable afterwards
do $$
declare t text;
begin
  foreach t in array array['departments','devices','corporate_networks','resource_categories','resources',
                           'policies','access_requests','approval_delegations']
  loop
    execute format('create trigger trg_00_set_company before insert on public.%I
                    for each row execute function private.set_company_from_session()', t);
  end loop;

  foreach t in array array['departments','profiles','approval_delegations','devices','corporate_networks',
                           'device_network_checks','resource_categories','resources','policies',
                           'access_requests','access_grants','access_decisions','access_sessions',
                           'audit_logs','alerts','notifications']
  loop
    execute format('create trigger trg_00_company_immutable before update on public.%I
                    for each row execute function private.forbid_company_change()', t);
  end loop;
end
$$;

-- 19.3 column / state guards
create trigger trg_10_guard before update on public.companies
  for each row execute function private.companies_guard();
create trigger trg_10_guard before update on public.profiles
  for each row execute function private.profiles_guard();
create trigger trg_10_guard before insert or update on public.devices
  for each row execute function private.devices_guard();
create trigger trg_10_guard before insert or update on public.access_requests
  for each row execute function private.access_requests_guard();
create trigger trg_10_guard before insert or update on public.access_grants
  for each row execute function private.access_grants_guard();
create trigger trg_10_guard before insert on public.approval_delegations
  for each row execute function private.approval_delegations_guard();
create trigger trg_10_guard before update on public.alerts
  for each row execute function private.alerts_guard();
create trigger trg_10_guard before update on public.notifications
  for each row execute function private.notifications_guard();
create trigger trg_10_guard before insert or update on public.access_sessions
  for each row execute function private.access_sessions_guard();

-- 19.4 actor stamping / policy versioning
create trigger trg_20_stamp before insert on public.corporate_networks
  for each row execute function private.stamp_created_by();
create trigger trg_20_stamp before insert on public.resources
  for each row execute function private.stamp_created_by();
create trigger trg_20_stamp before insert or update on public.policies
  for each row execute function private.policies_stamp();

-- 19.5 companies.policy_version bump on every policy / resource / category change
create trigger trg_50_bump_policy_version after insert or update or delete on public.policies
  for each row execute function private.bump_policy_version_trg();
create trigger trg_50_bump_policy_version after insert or update or delete on public.resources
  for each row execute function private.bump_policy_version_trg();
create trigger trg_50_bump_policy_version after insert or update or delete on public.resource_categories
  for each row execute function private.bump_policy_version_trg();

-- 19.6 audit events written by the database
create trigger trg_50_audit after insert or update or delete on public.policies
  for each row execute function private.audit_policies();
create trigger trg_50_audit after insert or update on public.access_requests
  for each row execute function private.audit_access_requests();
create trigger trg_50_audit after insert or update on public.devices
  for each row execute function private.audit_devices();
create trigger trg_50_audit after insert or update on public.access_grants
  for each row execute function private.audit_access_grants();
create trigger trg_50_audit after update on public.profiles
  for each row execute function private.audit_profiles();

-- 19.7 notification outbox (in-app)
create trigger trg_50_notify after insert or update on public.access_requests
  for each row execute function private.notify_access_requests();
create trigger trg_50_notify after insert on public.alerts
  for each row execute function private.notify_alerts();

-- 19.8 revocation / expiry side effects
create trigger trg_50_end_sessions after update of status on public.access_grants
  for each row execute function private.on_grant_status_change();
create trigger trg_50_end_sessions after update of status on public.devices
  for each row execute function private.on_device_status_change();
create trigger trg_50_end_sessions after update of status on public.profiles
  for each row execute function private.on_profile_status_change();
create trigger trg_50_sync_compliance after insert on public.device_network_checks
  for each row execute function private.sync_device_compliance();

-- 19.9 audit_logs: hash chain + append-only (no UPDATE / DELETE / TRUNCATE)
create trigger trg_10_chain before insert on public.audit_logs
  for each row execute function private.audit_logs_chain();
create trigger trg_10_block_mutation before update or delete on public.audit_logs
  for each row execute function private.audit_logs_block_mutation();
create trigger trg_10_block_truncate before truncate on public.audit_logs
  for each statement execute function private.audit_logs_block_mutation();

-- 19.10 Supabase Auth -> profiles (triggers on auth.users, dropped by name)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of email, last_sign_in_at on auth.users
  for each row execute function private.handle_auth_user_updated();

-- =============================================================================
-- SECTION 20. ROW LEVEL SECURITY ACTIVATION  (all 17 tables)
-- =============================================================================
-- NOT `FORCE`: the SECURITY DEFINER helpers read profiles as the table owner and
-- rely on the owner bypassing RLS. FORCE would make them recurse into policies.
alter table public.companies            enable row level security;
alter table public.departments          enable row level security;
alter table public.profiles             enable row level security;
alter table public.approval_delegations enable row level security;
alter table public.devices              enable row level security;
alter table public.corporate_networks   enable row level security;
alter table public.device_network_checks enable row level security;
alter table public.resource_categories  enable row level security;
alter table public.resources            enable row level security;
alter table public.policies             enable row level security;
alter table public.access_requests      enable row level security;
alter table public.access_grants        enable row level security;
alter table public.access_decisions     enable row level security;
alter table public.access_sessions      enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.alerts               enable row level security;
alter table public.notifications        enable row level security;

-- =============================================================================
-- SECTION 21. ROW LEVEL SECURITY POLICIES
-- =============================================================================
-- Rules applied everywhere:
--   * Every policy requires  company_id = current_company_id()  (matrix header rule).
--   * Policies are TO authenticated only. anon gets nothing.
--   * The backend (service_role) bypasses RLS; its rights come from GRANTs (section 22)
--     and its authorization checks must live in the backend code.
--   * (select ...) wrappers let PostgreSQL evaluate identity helpers once per query.
-- [CHANGE R-02] "own" rows are readable by EVERY role. The matrix lists "Read own" only for
-- employees, which would stop a lead or admin seeing their own profile/devices/requests.
-- All existing policies are dropped first so the file can be re-run.
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('companies','departments','profiles','approval_delegations','devices',
                        'corporate_networks','device_network_checks','resource_categories','resources',
                        'policies','access_requests','access_grants','access_decisions','access_sessions',
                        'audit_logs','alerts','notifications')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end
$$;

-- ---- companies: all read own; security_admin updates settings (guard allows only `settings)
create policy companies_select_own on public.companies for select to authenticated
  using (id = (select private.current_company_id()));
create policy companies_update_admin on public.companies for update to authenticated
  using      (id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- departments: all read; security_admin writes
create policy departments_select on public.departments for select to authenticated
  using (company_id = (select private.current_company_id()));
create policy departments_insert_admin on public.departments for insert to authenticated
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy departments_update_admin on public.departments for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy departments_delete_admin on public.departments for delete to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- profiles: own row; lead -> own team; security_admin -> all.  No INSERT/DELETE via API.
create policy profiles_select_self on public.profiles for select to authenticated
  using (company_id = (select private.current_company_id()) and id = (select auth.uid()));
create policy profiles_select_team on public.profiles for select to authenticated
  using (company_id = (select private.current_company_id())
         and manager_id = (select auth.uid()) and (select private.is_lead()));
create policy profiles_select_admin on public.profiles for select to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy profiles_update_self on public.profiles for update to authenticated
  using      (company_id = (select private.current_company_id()) and id = (select auth.uid()))
  with check (company_id = (select private.current_company_id()) and id = (select auth.uid()));
create policy profiles_update_admin on public.profiles for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- approval_delegations: lead creates/reads own; security_admin full
create policy delegations_select on public.approval_delegations for select to authenticated
  using (company_id = (select private.current_company_id())
         and ((lead_id = (select auth.uid()) and (select private.is_lead())) or (select private.is_security_admin())));
create policy delegations_insert on public.approval_delegations for insert to authenticated
  with check (company_id = (select private.current_company_id())
              and ((lead_id = (select auth.uid()) and (select private.is_lead())) or (select private.is_security_admin())));
create policy delegations_update_admin on public.approval_delegations for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy delegations_delete_admin on public.approval_delegations for delete to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- devices: read own / own team / all(admin); insert own (admin: any owner); update admin only
create policy devices_select on public.devices for select to authenticated
  using (company_id = (select private.current_company_id()) and private.can_view_user_records(owner_id));
create policy devices_insert on public.devices for insert to authenticated
  with check (company_id = (select private.current_company_id())
              and registered_by = (select auth.uid())
              and (owner_id = (select auth.uid()) or (select private.is_security_admin())));
create policy devices_update_admin on public.devices for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- corporate_networks: security_admin only (employees/leads: none)
create policy networks_select_admin on public.corporate_networks for select to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy networks_insert_admin on public.corporate_networks for insert to authenticated
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy networks_update_admin on public.corporate_networks for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy networks_delete_admin on public.corporate_networks for delete to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- device_network_checks: read own devices / own team / all(admin). Writes: backend only.
create policy network_checks_select on public.device_network_checks for select to authenticated
  using (company_id = (select private.current_company_id())
         and private.can_view_user_records(private.device_owner_id(device_id)));

-- ---- resource_categories & resources: employees/leads read ACTIVE; security_admin read/write all
create policy categories_select on public.resource_categories for select to authenticated
  using (company_id = (select private.current_company_id())
         and (status = 'active' or (select private.is_security_admin())));
create policy categories_insert_admin on public.resource_categories for insert to authenticated
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy categories_update_admin on public.resource_categories for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

create policy resources_select on public.resources for select to authenticated
  using (company_id = (select private.current_company_id())
         and (status = 'active' or (select private.is_security_admin())));
create policy resources_insert_admin on public.resources for insert to authenticated
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy resources_update_admin on public.resources for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- policies: security_admin only
create policy policies_select_admin on public.policies for select to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy policies_insert_admin on public.policies for insert to authenticated
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy policies_update_admin on public.policies for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy policies_delete_admin on public.policies for delete to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- access_requests
-- read: own, assigned to me (lead/delegate/escalated admin), or all (security_admin)
create policy requests_select on public.access_requests for select to authenticated
  using (company_id = (select private.current_company_id())
         and (requester_id = (select auth.uid())
              or assigned_lead_id = (select auth.uid())
              or (select private.is_security_admin())));
-- insert: own only. status/approver/decision columns are forced by access_requests_guard.
create policy requests_insert_own on public.access_requests for insert to authenticated
  with check (company_id = (select private.current_company_id())
              and requester_id = (select auth.uid())
              and status = 'pending');
-- requester may cancel while pending (guard: only status -> 'cancelled')
create policy requests_cancel_own on public.access_requests for update to authenticated
  using      (company_id = (select private.current_company_id())
              and requester_id = (select auth.uid()) and status = 'pending')
  with check (company_id = (select private.current_company_id())
              and requester_id = (select auth.uid()) and status in ('pending', 'cancelled'));
-- assigned approver may decide while pending (guard: not own request, stamps decided_*)
create policy requests_decide_assigned on public.access_requests for update to authenticated
  using      (company_id = (select private.current_company_id())
              and assigned_lead_id = (select auth.uid()) and status = 'pending'
              and (select private.current_app_role()) in ('lead', 'security_admin'))
  with check (company_id = (select private.current_company_id())
              and assigned_lead_id = (select auth.uid()) and status in ('pending', 'approved', 'rejected'));

-- ---- access_grants: read own / own team / all(admin); security_admin revokes (guard allows only revoke)
create policy grants_select on public.access_grants for select to authenticated
  using (company_id = (select private.current_company_id()) and private.can_view_user_records(user_id));
create policy grants_revoke_admin on public.access_grants for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()) and status = 'active')
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- access_decisions / access_sessions: read own / own team / all(admin). Writes: backend only.
create policy decisions_select on public.access_decisions for select to authenticated
  using (company_id = (select private.current_company_id()) and private.can_view_user_records(user_id));
create policy sessions_select on public.access_sessions for select to authenticated
  using (company_id = (select private.current_company_id()) and private.can_view_user_records(user_id));

-- ---- alerts: lead -> own team (optional in the matrix, implemented); security_admin read + update status
create policy alerts_select_team on public.alerts for select to authenticated
  using (company_id = (select private.current_company_id())
         and user_id is not null and private.is_team_member(user_id));
create policy alerts_select_admin on public.alerts for select to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));
create policy alerts_update_admin on public.alerts for update to authenticated
  using      (company_id = (select private.current_company_id()) and (select private.is_security_admin()))
  with check (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- audit_logs: security_admin read only. No INSERT/UPDATE/DELETE policy exists for any API role.
create policy audit_select_admin on public.audit_logs for select to authenticated
  using (company_id = (select private.current_company_id()) and (select private.is_security_admin()));

-- ---- notifications: each user reads and marks read their OWN rows (every role)
create policy notifications_select_own on public.notifications for select to authenticated
  using (company_id = (select private.current_company_id()) and recipient_id = (select auth.uid()));
create policy notifications_mark_read_own on public.notifications for update to authenticated
  using      (company_id = (select private.current_company_id()) and recipient_id = (select auth.uid()))
  with check (company_id = (select private.current_company_id()) and recipient_id = (select auth.uid()));

-- =============================================================================
-- SECTION 22. GRANTS AND DATABASE PERMISSIONS
-- =============================================================================
-- WHY THIS SECTION MATTERS: Supabase configures default privileges so that every new table in
-- `public` is fully accessible to anon, authenticated and service_role. RLS is then the ONLY
-- barrier, and service_role (which bypasses RLS) could UPDATE audit_logs. Everything is
-- therefore revoked first and granted back per the RLS matrix (least privilege).
-- Three layers cooperate:
--   1. GRANT (table/column privileges)  -> which statements/columns an API role may even attempt
--   2. RLS policies                      -> which ROWS (tenant, own/team/all)
--   3. Guard triggers                    -> which VALUES / state transitions per app role
-- service_role bypasses layer 2 and the API-only part of layer 3, so only layer 1 limits it.
-- That is why its grants below follow the matrix's "Service (backend)" column exactly.

-- 22.1 Functions: nothing is executable by default.
revoke all on all functions in schema private from public, anon, authenticated, service_role;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- Helpers that invoker-security RLS policies / guard triggers must be able to call.
grant execute on function
  private.is_api_caller(),
  private.changed_columns(jsonb, jsonb),
  private.current_company_id(),
  private.current_app_role(),
  private.is_security_admin(),
  private.is_lead(),
  private.is_team_member(uuid),
  private.can_view_user_records(uuid),
  private.device_owner_id(uuid),
  private.get_profile(uuid),
  private.get_request(uuid),
  private.resolve_approver(uuid),
  private.request_refs_valid(uuid, uuid, uuid)
to authenticated, service_role;

-- Backend-only RPCs in the exposed `public` schema.
revoke all on function public.verify_audit_chain(uuid)   from public, anon, authenticated;
revoke all on function public.expire_due_grants()        from public, anon, authenticated;
revoke all on function public.expire_overdue_requests()  from public, anon, authenticated;
grant execute on function public.verify_audit_chain(uuid)  to service_role;
grant execute on function public.expire_due_grants()       to service_role;
grant execute on function public.expire_overdue_requests() to service_role;

-- Supabase Auth runs the auth.users triggers; give it access in case a project enforces it.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    grant usage on schema private to supabase_auth_admin;
    grant execute on function private.handle_new_user(), private.handle_auth_user_updated() to supabase_auth_admin;
  end if;
end
$$;

-- 22.2 Tables: revoke the permissive defaults on exactly our 17 tables.
revoke all on
  public.companies, public.departments, public.profiles, public.approval_delegations, public.devices,
  public.corporate_networks, public.device_network_checks, public.resource_categories, public.resources,
  public.policies, public.access_requests, public.access_grants, public.access_decisions,
  public.access_sessions, public.audit_logs, public.alerts, public.notifications
from public, anon, authenticated, service_role;

-- 22.3 authenticated (logged-in users; further limited by RLS + guards).
-- Column lists exclude every system-owned column (company_id, *_by stamps, version, timestamps,
-- compliance_status, decided_*, ...), so a tampered payload is rejected before RLS even runs.
grant select on
  public.companies, public.departments, public.profiles, public.approval_delegations, public.devices,
  public.corporate_networks, public.device_network_checks, public.resource_categories, public.resources,
  public.policies, public.access_requests, public.access_grants, public.access_decisions,
  public.access_sessions, public.audit_logs, public.alerts, public.notifications
to authenticated;

grant update (settings)                                                         on public.companies to authenticated;
grant insert (name, description), update (name, description), delete            on public.departments to authenticated;
grant update (full_name, employee_code, role, department_id, manager_id, job_title, status) on public.profiles to authenticated;
grant insert (lead_id, delegate_id, starts_at, ends_at, reason),
      update (delegate_id, starts_at, ends_at, reason), delete                  on public.approval_delegations to authenticated;
grant insert (device_name, device_type, os_name, os_version, hardware_id, mac_address, owner_id),
      update (device_name, device_type, os_name, os_version, mac_address, status, revoke_reason) on public.devices to authenticated;
grant insert (name, network_type, cidr, ssid, is_authorized, is_active, description),
      update (name, network_type, cidr, ssid, is_authorized, is_active, description), delete on public.corporate_networks to authenticated;
grant insert (name, description, status), update (name, description, status)   on public.resource_categories to authenticated;
grant insert (name, resource_type, identifier, category_id, description, sensitivity, status),
      update (name, resource_type, identifier, category_id, description, sensitivity, status) on public.resources to authenticated;
grant insert (name, description, effect, resource_id, category_id, applies_to_role, applies_to_department_id,
              require_authorized_network, require_compliant_device, max_grant_minutes, priority, extra_conditions, status),
      update (name, description, effect, resource_id, category_id, applies_to_role, applies_to_department_id,
              require_authorized_network, require_compliant_device, max_grant_minutes, priority, extra_conditions, status),
      delete                                                                    on public.policies to authenticated;
grant insert (resource_id, device_id, reason, requested_duration_minutes),
      update (status, decision_reason)                                          on public.access_requests to authenticated;
grant update (status, revoke_reason)                                            on public.access_grants to authenticated;
grant update (status, resolution_note)                                          on public.alerts to authenticated;
grant update (read_at)                                                          on public.notifications to authenticated;
-- access_decisions, access_sessions, audit_logs, device_network_checks: SELECT only (above).

-- 22.4 service_role = the trusted backend (matrix "Service" column). It bypasses RLS but NOT these grants.
-- [ASSUMPTION A-18] Document says service has "Insert, read" on device_network_checks yet also says to purge
-- old rows, so DELETE is granted there for the retention job. audit_logs / access_decisions get NO update/delete.
grant select, insert, update on public.companies, public.departments, public.profiles, public.devices,
                               public.access_requests, public.access_grants, public.access_sessions,
                               public.notifications to service_role;
grant select, insert, delete on public.device_network_checks to service_role;
grant select, insert         on public.access_decisions, public.alerts, public.audit_logs to service_role;
grant select                 on public.corporate_networks, public.resource_categories, public.resources,
                               public.policies, public.approval_delegations to service_role;
-- anon: no privileges at all on any of the 17 tables.

-- 22.5 Realtime: portal notifications and session status changes can be pushed (RLS still applies).
-- Skipped silently when the publication does not exist (e.g. a plain PostgreSQL test database).
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['notifications', 'access_sessions']
    loop
      if not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        begin
          execute format('alter publication supabase_realtime add table public.%I', t);
        exception when others then
          raise warning 'Could not add public.% to supabase_realtime (%). Add it in Dashboard > Database > Replication if you need live push.', t, sqlerrm;
        end;
      end if;
    end loop;
  end if;
end
$$;

-- =============================================================================
-- OPTIONAL: scheduled jobs with pg_cron (the document assigns these to "a scheduled job").
-- Enable the pg_cron extension in Dashboard > Database > Extensions first. Remove this block
-- if the backend runs the jobs instead (it can call public.expire_due_grants() with service_role).
-- =============================================================================
-- select cron.schedule('cp-expire-grants',   '* * * * *', $$select public.expire_due_grants()$$);
-- select cron.schedule('cp-expire-requests', '* * * * *', $$select public.expire_overdue_requests()$$);

-- =============================================================================
-- SECTION 23. OPTIONAL SEED DATA FOR DEVELOPMENT / TESTING   (commented out on purpose)
-- To use: delete the "/*" line and the "*/" line, run, then follow the bootstrap steps.
-- =============================================================================
-- SEED-BEGIN
/*
insert into public.companies (name, slug, settings)
values ('Acme Dev Co', 'acme-dev',
        '{"stale_after_minutes": 60, "default_grant_minutes": 60, "log_full_urls": false}'::jsonb)
on conflict (slug) do nothing;

insert into public.departments (company_id, name, description)
select c.id, d.name, d.descr
from public.companies c,
     (values ('Engineering', 'Product engineering'), ('Finance', 'Finance and accounting')) as d(name, descr)
where c.slug = 'acme-dev'
on conflict (company_id, name) do nothing;

insert into public.resource_categories (company_id, name, description)
select c.id, v.name, v.descr
from public.companies c,
     (values ('Social Media', 'Social networks'), ('Finance Systems', 'Banking and ERP'), ('Source Code', 'Git hosting')) as v(name, descr)
where c.slug = 'acme-dev'
on conflict (company_id, name) do nothing;

insert into public.resources (company_id, name, resource_type, identifier, category_id, sensitivity)
select c.id, 'Example Social', 'website', 'social.example.com', k.id, 'medium'
from public.companies c
join public.resource_categories k on k.company_id = c.id and k.name = 'Social Media'
where c.slug = 'acme-dev'
on conflict (company_id, resource_type, identifier) do nothing;

insert into public.policies (company_id, name, description, effect, category_id, status)
select c.id, 'Social media requires approval', 'Sample draft policy', 'REQUIRES_APPROVAL', k.id, 'draft'
from public.companies c
join public.resource_categories k on k.company_id = c.id and k.name = 'Social Media'
where c.slug = 'acme-dev'
on conflict (company_id, name) do nothing;

-- BOOTSTRAP THE FIRST SECURITY ADMIN
-- 1) Dashboard > Authentication > Users > "Add user" (create the person with a real email).
--    A user created this way has NO company, therefore NO profile and NO data access yet.
-- 2) Replace the e-mail below and run (as postgres in the SQL Editor):
insert into public.profiles (id, company_id, full_name, email, role)
select u.id, c.id, 'First Admin', lower(u.email), 'security_admin'
from auth.users u, public.companies c
where lower(u.email) = 'admin@example.com' and c.slug = 'acme-dev'
on conflict (id) do update set role = 'security_admin';
*/
-- SEED-END

commit;
