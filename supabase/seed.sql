-- Run AFTER creating the two users in Supabase → Authentication → Users → "Add user".
-- (Set "Auto confirm user" on. Then turn OFF public sign-ups:
--  Authentication → Sign In / Providers → Email → disable "Allow new users to sign up".)
--
-- Admins log in with a username; the site turns it into <username>@aleksos.app
-- (see adminEmailDomain in src/config/site.js). Create the users with exactly these emails:
--   lazare@aleksos.app   (username: Lazare)
--   aleksa@aleksos.app   (username: Aleksa)

update public.profiles p
set display_name = 'Lazare', is_admin = true
from auth.users u
where u.id = p.id and u.email = 'lazare@aleksos.app';

update public.profiles p
set display_name = 'Aleksa', is_admin = true
from auth.users u
where u.id = p.id and u.email = 'aleksa@aleksos.app';

select p.display_name, p.is_admin, u.email
from public.profiles p join auth.users u on u.id = p.id;
