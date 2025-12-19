-- Waitlist subscriptions table for pre-launch landing page
-- Stores email addresses of users who join the waitlist

create table if not exists public.waitlist_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed', -- 'subscribed' | 'unsubscribed'
  source text,                               -- optional, e.g. 'landing_page'
  created_at timestamptz not null default now()
);

comment on table public.waitlist_subscriptions is 'Pre-launch waitlist signups from marketing landing page';

comment on column public.waitlist_subscriptions.email is 'Subscriber email address (unique)';

comment on column public.waitlist_subscriptions.status is 'Subscription status (subscribed/unsubscribed)';

comment on column public.waitlist_subscriptions.source is 'Optional source identifier for analytics (e.g. landing page, campaign)';

-- Basic RLS: allow inserts from anonymous users via API if policy is enabled later
alter table public.waitlist_subscriptions enable row level security;

-- By default, block all access; explicit policies should be added via Supabase dashboard or a follow-up migration


