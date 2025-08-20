alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

create policy orders_admin_read
  on public.orders
  for select
  to authenticated
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy orders_public_insert
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

create policy orders_admin_update
  on public.orders
  for update
  to authenticated
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  with check (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
