create table if not exists public.pindeck_site_config (
  id text primary key,
  contract_address text null check (
    contract_address is null
    or lower(contract_address) = 'tba'
    or contract_address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
  ),
  updated_at timestamptz not null default now()
);

insert into public.pindeck_site_config (id, contract_address)
values ('main', 'tba')
on conflict (id) do nothing;

alter table public.pindeck_site_config enable row level security;

drop policy if exists "Public can read the Pindeck CA" on public.pindeck_site_config;
create policy "Public can read the Pindeck CA"
on public.pindeck_site_config for select
to anon, authenticated
using (id = 'main');

grant select on public.pindeck_site_config to anon, authenticated;
revoke insert, update, delete on public.pindeck_site_config from anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pindeck_site_config'
  ) then
    alter publication supabase_realtime add table public.pindeck_site_config;
  end if;
end $$;
