-- 1) Schema guards and helpers ---------------------------------------------

-- Table used by is_superadmin(uuid). Safe if it already exists.
create table if not exists public.superadmins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Ensure profiles.id FK is correct (id -> auth.users.id)
alter table public.profiles
  drop constraint if exists profiles_id_fkey,
  add  constraint profiles_id_fkey
    foreign key (id) references auth.users(id) on delete cascade;

-- 2) Repair data that might violate the new CHECK --------------------------

-- Clear track for non-students to avoid constraint failures during validate
update public.profiles
set track = null
where role in ('teacher','superadmin') and track is not null;

-- Normalize student tracks (optional tidying)
update public.profiles
set track = case
  when role = 'student' and lower(coalesce(track,'')) in ('general','general english','gen') then 'General English'
  when role = 'student' and lower(coalesce(track,'')) in ('business','business english','biz') then 'Business English'
  else track
end;

-- 3) Recreate role-aware profiles_track_check ------------------------------

-- Drop existing constraint if present
alter table public.profiles drop constraint if exists profiles_track_check;

-- New rule:
--  - students: track is NULL or {'General English','Business English'}
--  - teachers/superadmins: track MUST be NULL
alter table public.profiles
  add constraint profiles_track_check
  check (
    (role = 'student' and (track is null or track in ('General English','Business English')))
    or (role in ('teacher','superadmin') and track is null)
  ) not valid;

-- Validate after data repair
alter table public.profiles validate constraint profiles_track_check;

-- Ensure track has no default (student picks it later)
alter table public.profiles
  alter column track drop default;

-- Role default helps new inserts if trigger skipped (defensive)
alter table public.profiles
  alter column role set default 'student';

-- 4) Safe signup trigger: insert minimal, never block auth creation --------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  begin
    insert into public.profiles (id, email, role, track)
    values (new.id, new.email, 'student', null)
    on conflict (id) do nothing;
  exception when others then
    -- Never block auth creation if profiles insert fails
    null;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- 5) Role setter that works from SQL editor & app --------------------------

create or replace function public.set_user_role(target_email text, new_role text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  v_is_db_owner boolean := current_user in ('postgres','service_role');
begin
  if not v_is_db_owner and (v_uid is null or not public.is_superadmin(v_uid)) then
    raise exception 'Only superadmins can change roles';
  end if;

  if new_role not in ('student','teacher','superadmin') then
    raise exception 'Invalid role: %', new_role;
  end if;

  update public.profiles p
     set role  = new_role,
         track = case when new_role='student' then track else null end
  from auth.users u
  where u.email = target_email and p.id = u.id;

  if new_role = 'superadmin' then
    insert into public.superadmins(user_id)
    select u.id from auth.users u where u.email = target_email
    on conflict (user_id) do nothing;
  else
    delete from public.superadmins s
    using auth.users u
    where u.email = target_email and s.user_id = u.id;
  end if;
end;
$$;

revoke all on function public.set_user_role(text, text) from public;
grant execute on function public.set_user_role(text, text) to authenticated;

-- 6) Seed roles for your three emails (no-op if users don’t exist yet) -----

-- Student
update public.profiles p
set role = 'student'
from auth.users u
where u.email = 'beriso.jf@gmail.com' and p.id = u.id;

-- Teacher
update public.profiles p
set role = 'teacher', track = null
from auth.users u
where u.email = 'joana.beriso@gmail.com' and p.id = u.id;

-- Superadmin (UI role + RLS power)
update public.profiles p
set role = 'superadmin', track = null
from auth.users u
where u.email = 'upraizenlabs@gmail.com' and p.id = u.id;

insert into public.superadmins(user_id)
select u.id from auth.users u
where u.email = 'upraizenlabs@gmail.com'
on conflict (user_id) do nothing;

-- Optional: demote previous superadmin if present
delete from public.superadmins s
using auth.users u
where u.email = 'jfaye.beriso@gmail.com' and s.user_id = u.id;
