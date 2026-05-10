-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Demo seed — 4 visible clinics for the home page (mockup parity).         ║
-- ║ Skip in production. Idempotent (safe to re-run).                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Demo "owner" users (system-only — they don't log in)
insert into public.users (id, email, name, role, status) values
  ('00000000-0000-0000-0000-000000000001', 'system+demo1@surbeau.local', 'Demo Owner 1', 'clinic', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'system+demo2@surbeau.local', 'Demo Owner 2', 'clinic', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'system+demo3@surbeau.local', 'Demo Owner 3', 'clinic', 'active'),
  ('00000000-0000-0000-0000-000000000004', 'system+demo4@surbeau.local', 'Demo Owner 4', 'clinic', 'active')
on conflict (id) do nothing;

-- Clinics (idempotent via clinic_name + user_id)
insert into public.clinic_profiles
  (user_id, clinic_name, province, district, phone, status, subscription_tier, latitude, longitude, rating_avg, rating_count)
values
  ('00000000-0000-0000-0000-000000000001', 'Glow Up Clinic สยาม',     'กรุงเทพมหานคร', 'BTS สยาม',  '021234567', 'approved', 'premier',  13.7461, 100.5347, 4.90, 234),
  ('00000000-0000-0000-0000-000000000002', 'Clear Skin Clinic',       'กรุงเทพมหานคร', 'พระราม 9',  '021234568', 'approved', 'premier',  13.7567, 100.5650, 4.80, 189),
  ('00000000-0000-0000-0000-000000000003', 'Perfect Nose Center',     'กรุงเทพมหานคร', 'ทองหล่อ',   '021234569', 'approved', 'verified', 13.7320, 100.5800, 4.70,  92),
  ('00000000-0000-0000-0000-000000000004', 'Beauty Clinic ลาดพร้าว',  'กรุงเทพมหานคร', 'ลาดพร้าว',  '021234570', 'approved', 'free',     13.8160, 100.5610, 4.50,  41)
on conflict (user_id) do nothing;

-- Campaigns
with c as (select id, clinic_name from public.clinic_profiles where user_id::text like '00000000-0000-0000-0000-00000000000_')
insert into public.campaigns (clinic_id, title, description, normal_price, promo_price, commission_per_success, is_active, is_featured)
select c.id,
  case c.clinic_name
    when 'Glow Up Clinic สยาม'    then 'โบท็อกซ์หน้าผาก รุ่นพรีเมียม'
    when 'Clear Skin Clinic'      then 'เลเซอร์หน้าใส คอร์ส 3 ครั้ง'
    when 'Perfect Nose Center'    then 'เสริมจมูก Closed Technique'
    else 'ทรีตเมนต์ฟื้นฟูผิวหน้า'
  end,
  'ดูแลโดยแพทย์ผู้เชี่ยวชาญ ใช้ผลิตภัณฑ์ของแท้นำเข้า',
  case c.clinic_name
    when 'Glow Up Clinic สยาม'    then 9990
    when 'Clear Skin Clinic'      then 7500
    when 'Perfect Nose Center'    then 50000
    else 3500
  end,
  case c.clinic_name
    when 'Glow Up Clinic สยาม'    then 4990
    when 'Clear Skin Clinic'      then 3500
    when 'Perfect Nose Center'    then 30000
    else 2000
  end,
  case c.clinic_name
    when 'Glow Up Clinic สยาม'    then 500
    when 'Clear Skin Clinic'      then 350
    when 'Perfect Nose Center'    then 1500
    else 200
  end,
  true,
  c.clinic_name in ('Glow Up Clinic สยาม', 'Clear Skin Clinic')
from c
where not exists (select 1 from public.campaigns where clinic_id = c.id);
