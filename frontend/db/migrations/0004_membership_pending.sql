-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Add 'pending' state to membership_status for manual admin approval.       ║
-- ║ User submits payment → status='pending' → admin verifies → 'active'       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

alter type membership_status add value if not exists 'pending';

-- Update the "one active per user" partial unique idx to also allow ONE pending
-- (so a user can have at most: 1 pending + 1 active concurrently, not 2 of either)
drop index if exists memberships_one_active_per_user;
create unique index if not exists memberships_one_active_per_user
  on public.memberships(user_id) where status = 'active';
create unique index if not exists memberships_one_pending_per_user
  on public.memberships(user_id) where status = 'pending';
