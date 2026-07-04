alter table if exists auth_sessions
  add column if not exists refresh_jti varchar(128),
  add column if not exists replaced_by_jti varchar(128),
  add column if not exists last_used_at timestamptz;

create table if not exists otp_challenges (
  id uuid primary key default gen_random_uuid(),
  phone varchar(20) not null,
  purpose varchar(40) not null,
  code_hash varchar(255) not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists otp_challenges_phone_purpose_expires_at_idx
  on otp_challenges (phone, purpose, expires_at);

create table if not exists admin_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admin_users(id) on delete cascade,
  code_hash varchar(255) not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_recovery_codes_admin_id_used_at_idx
  on admin_recovery_codes (admin_id, used_at);

alter table if exists payment_events
  add column if not exists payload_hash varchar(128);

create table if not exists idempotency_records (
  id uuid primary key default gen_random_uuid(),
  scope varchar(80) not null,
  key varchar(255) not null,
  request_hash varchar(128) not null,
  response_status integer,
  response_body jsonb,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint idempotency_records_scope_key_key unique (scope, key)
);
