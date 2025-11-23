-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACCOUNTS
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null, -- 'Banque', 'Espèces', 'Épargne'
  initial_balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  account_id uuid references accounts(id) on delete cascade not null,
  date date not null,
  category text not null,
  description text,
  amount numeric not null,
  type text not null, -- 'income', 'expense', 'transfer'
  frequency text default 'ponctuel',
  destination_account_id uuid references accounts(id), -- For transfers
  transfer_fee numeric default 0,
  attachment_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GOALS
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  category text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GOAL CONTRIBUTIONS
create table goal_contributions (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  amount numeric not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;

-- Policies to allow users to see/edit only their own data
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can crud own accounts" on accounts for all using (auth.uid() = user_id);
create policy "Users can crud own transactions" on transactions for all using (auth.uid() = user_id);
create policy "Users can crud own goals" on goals for all using (auth.uid() = user_id);
create policy "Users can crud own contributions" on goal_contributions for all using ( exists (select 1 from goals where id = goal_contributions.goal_id and user_id = auth.uid()) );

-- FUNCTION to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
