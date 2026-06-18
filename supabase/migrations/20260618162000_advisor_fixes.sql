create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index businesses_owner_user_id_idx on public.businesses (owner_user_id);
create index notifications_lead_id_idx on public.notifications (lead_id);

alter policy businesses_owner_access on public.businesses
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

alter policy services_owner_access on public.services
using (
  exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
);

alter policy faqs_owner_access on public.faqs
using (
  exists (
    select 1 from public.businesses
    where businesses.id = faqs.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = faqs.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
);

alter policy leads_owner_access on public.leads
using (
  exists (
    select 1 from public.businesses
    where businesses.id = leads.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = leads.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
);

alter policy conversations_owner_access on public.conversations
using (
  exists (
    select 1 from public.businesses
    where businesses.id = conversations.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = conversations.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
);

alter policy notifications_owner_access on public.notifications
using (
  exists (
    select 1 from public.businesses
    where businesses.id = notifications.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = notifications.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
);

alter policy eval_cases_owner_access on public.eval_cases
using (
  exists (
    select 1 from public.businesses
    where businesses.id = eval_cases.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = eval_cases.business_id
      and businesses.owner_user_id = (select auth.uid())
  )
);
