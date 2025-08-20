create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  unit text,
  price numeric(10,2),
  price_min numeric(10,2),
  price_max numeric(10,2),
  note text,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  product_id uuid references public.products(id),
  product_name text not null,
  category text not null,
  unit_price numeric(10,2) not null,
  qty integer not null check (qty > 0),
  total numeric(10,2) not null,
  pickup_date date,
  notes text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);
