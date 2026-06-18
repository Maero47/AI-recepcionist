create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  website_url text,
  phone_number text,
  ai_forwarding_number text,
  timezone text not null default 'Europe/London',
  service_area text not null default '',
  business_hours text not null default '',
  emergency_handoff_number text,
  notification_email text,
  notification_phone text,
  booking_link text,
  consent_disclosure text,
  handoff_rules text[] not null default '{}',
  never_say text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text not null default '',
  starting_price text not null default '',
  price_note text not null default '',
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  question text not null,
  approved_answer text not null,
  category text not null default 'general',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source text not null check (source in ('phone', 'website', 'manual')),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  service_requested text not null,
  location text,
  preferred_time text,
  urgency text not null default 'standard' check (urgency in ('low', 'standard', 'urgent')),
  notes text not null default '',
  summary text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'won', 'lost')),
  estimated_value numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  channel text not null check (channel in ('phone', 'website', 'manual')),
  provider_call_id text,
  transcript text not null default '',
  ai_summary text not null default '',
  recording_url text,
  escalation_reason text,
  outcome text not null default 'lead_created' check (
    outcome in ('lead_created', 'answered_faq', 'escalated', 'callback_requested')
  ),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  recipient text not null,
  status text not null check (status in ('sent', 'skipped', 'failed')),
  detail text not null default '',
  sent_at timestamptz not null default now()
);

create table public.eval_cases (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  scenario text not null,
  expected_behavior text not null,
  escalation_required boolean not null default false,
  actual_response text,
  pass_fail text not null default 'untested' check (pass_fail in ('untested', 'pass', 'fail')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index services_business_id_idx on public.services (business_id);
create index faqs_business_id_idx on public.faqs (business_id);
create index leads_business_status_idx on public.leads (business_id, status);
create index leads_business_created_idx on public.leads (business_id, created_at desc);
create index conversations_business_created_idx on public.conversations (business_id, created_at desc);
create index conversations_lead_id_idx on public.conversations (lead_id);
create index notifications_business_sent_idx on public.notifications (business_id, sent_at desc);
create index eval_cases_business_id_idx on public.eval_cases (business_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger faqs_set_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.faqs enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.notifications enable row level security;
alter table public.eval_cases enable row level security;

create policy businesses_owner_access on public.businesses
for all using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy services_owner_access on public.services
for all using (
  exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy faqs_owner_access on public.faqs
for all using (
  exists (
    select 1 from public.businesses
    where businesses.id = faqs.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = faqs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy leads_owner_access on public.leads
for all using (
  exists (
    select 1 from public.businesses
    where businesses.id = leads.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = leads.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy conversations_owner_access on public.conversations
for all using (
  exists (
    select 1 from public.businesses
    where businesses.id = conversations.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = conversations.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy notifications_owner_access on public.notifications
for all using (
  exists (
    select 1 from public.businesses
    where businesses.id = notifications.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = notifications.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy eval_cases_owner_access on public.eval_cases
for all using (
  exists (
    select 1 from public.businesses
    where businesses.id = eval_cases.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = eval_cases.business_id
      and businesses.owner_user_id = auth.uid()
  )
);
