begin;

insert into regions (id, name, created_at, updated_at)
values
  ('00000000-0000-1001-0000-000000000001', '{"uz":"Toshkent","ru":"Ташкент","en":"Tashkent"}', now(), now()),
  ('00000000-0000-1001-0000-000000000002', '{"uz":"Samarqand","ru":"Самарканд","en":"Samarkand"}', now(), now()),
  ('00000000-0000-1001-0000-000000000003', '{"uz":"Buxoro","ru":"Бухара","en":"Bukhara"}', now(), now()),
  ('00000000-0000-1001-0000-000000000004', '{"uz":"Xorazm","ru":"Хорезм","en":"Khorezm"}', now(), now()),
  ('00000000-0000-1001-0000-000000000005', '{"uz":"Farg''ona","ru":"Фергана","en":"Fergana"}', now(), now()),
  ('00000000-0000-1001-0000-000000000006', '{"uz":"Namangan","ru":"Наманган","en":"Namangan"}', now(), now()),
  ('00000000-0000-1001-0000-000000000007', '{"uz":"Jizzax","ru":"Джизак","en":"Jizzakh"}', now(), now()),
  ('00000000-0000-1001-0000-000000000008', '{"uz":"Qoraqalpog''iston","ru":"Каракалпакстан","en":"Karakalpakstan"}', now(), now())
on conflict (id) do update
set name = excluded.name, updated_at = now();

insert into cities (id, region_id, name, slug, sort_order, created_at, updated_at)
values
  ('00000000-0000-1002-0000-000000000001', '00000000-0000-1001-0000-000000000001', '{"uz":"Toshkent","ru":"Ташкент","en":"Tashkent"}', 'toshkent', 1, now(), now()),
  ('00000000-0000-1002-0000-000000000002', '00000000-0000-1001-0000-000000000002', '{"uz":"Samarqand","ru":"Самарканд","en":"Samarkand"}', 'samarqand', 2, now(), now()),
  ('00000000-0000-1002-0000-000000000003', '00000000-0000-1001-0000-000000000003', '{"uz":"Buxoro","ru":"Бухара","en":"Bukhara"}', 'buxoro', 3, now(), now()),
  ('00000000-0000-1002-0000-000000000004', '00000000-0000-1001-0000-000000000004', '{"uz":"Xiva","ru":"Хива","en":"Khiva"}', 'xiva', 4, now(), now()),
  ('00000000-0000-1002-0000-000000000005', '00000000-0000-1001-0000-000000000005', '{"uz":"Farg''ona","ru":"Фергана","en":"Fergana"}', 'fargona', 5, now(), now()),
  ('00000000-0000-1002-0000-000000000006', '00000000-0000-1001-0000-000000000006', '{"uz":"Namangan","ru":"Наманган","en":"Namangan"}', 'namangan', 6, now(), now()),
  ('00000000-0000-1002-0000-000000000007', '00000000-0000-1001-0000-000000000001', '{"uz":"Charvak","ru":"Чарвак","en":"Charvak"}', 'charvak', 7, now(), now()),
  ('00000000-0000-1002-0000-000000000008', '00000000-0000-1001-0000-000000000001', '{"uz":"Chimgan","ru":"Чимган","en":"Chimgan"}', 'chimgan', 8, now(), now()),
  ('00000000-0000-1002-0000-000000000009', '00000000-0000-1001-0000-000000000007', '{"uz":"Zaamin","ru":"Заамин","en":"Zaamin"}', 'zaamin', 9, now(), now()),
  ('00000000-0000-1002-0000-00000000000a', '00000000-0000-1001-0000-000000000008', '{"uz":"Nukus","ru":"Нукус","en":"Nukus"}', 'nukus', 10, now(), now())
on conflict (id) do update
set region_id = excluded.region_id, name = excluded.name, slug = excluded.slug, sort_order = excluded.sort_order, updated_at = now();

insert into amenities (id, code, name, created_at, updated_at)
values
  ('00000000-0000-1003-0000-000000000001', 'wifi', '{"uz":"Bepul Wi-Fi","ru":"Бесплатный Wi-Fi","en":"Free Wi-Fi"}', now(), now()),
  ('00000000-0000-1003-0000-000000000002', 'pool', '{"uz":"Hovuz","ru":"Бассейн","en":"Pool"}', now(), now()),
  ('00000000-0000-1003-0000-000000000003', 'parking', '{"uz":"Avtoturargoh","ru":"Парковка","en":"Parking"}', now(), now()),
  ('00000000-0000-1003-0000-000000000004', 'breakfast', '{"uz":"Nonushta","ru":"Завтрак","en":"Breakfast"}', now(), now()),
  ('00000000-0000-1003-0000-000000000005', 'air_conditioner', '{"uz":"Konditsioner","ru":"Кондиционер","en":"Air conditioner"}', now(), now()),
  ('00000000-0000-1003-0000-000000000006', 'tv', '{"uz":"Televizor","ru":"Телевизор","en":"TV"}', now(), now())
on conflict (code) do update
set name = excluded.name, updated_at = now();

insert into room_types (id, code, name, created_at, updated_at)
values
  ('00000000-0000-1004-0000-000000000001', 'standard', '{"uz":"Standart","ru":"Стандарт","en":"Standard"}', now(), now()),
  ('00000000-0000-1004-0000-000000000002', 'deluxe', '{"uz":"Deluxe","ru":"Делюкс","en":"Deluxe"}', now(), now()),
  ('00000000-0000-1004-0000-000000000003', 'suite', '{"uz":"Suite","ru":"Люкс","en":"Suite"}', now(), now())
on conflict (code) do update
set name = excluded.name, updated_at = now();

insert into cancellation_policies (id, name, rules, refundable_until_hours, created_at, updated_at)
values (
  '00000000-0000-1005-0000-000000000001',
  '{"uz":"Moslashuvchan bekor qilish","ru":"Гибкая отмена","en":"Flexible cancellation"}',
  '[{"beforeHours":24,"penaltyPercent":0},{"beforeHours":6,"penaltyPercent":50},{"beforeHours":0,"penaltyPercent":100}]',
  24,
  now(),
  now()
)
on conflict (id) do update
set name = excluded.name, rules = excluded.rules, refundable_until_hours = excluded.refundable_until_hours, updated_at = now();

insert into users (
  id, first_name, last_name, phone, email, status, preferred_language,
  blocked_reason, phone_verified_at, last_login_at, created_at, updated_at
)
values
  ('00000000-0000-2001-0000-000000000001', 'Anvar', 'Karimov', '+998901001001', 'anvar.karimov@demo.uz', 'active', 'uz', null, now() - interval '90 days', now() - interval '2 hours', now() - interval '120 days', now()),
  ('00000000-0000-2001-0000-000000000002', 'Dilnoza', 'Rahimova', '+998901001002', 'dilnoza.rahimova@demo.uz', 'active', 'uz', null, now() - interval '80 days', now() - interval '1 day', now() - interval '118 days', now()),
  ('00000000-0000-2001-0000-000000000003', 'Bobur', 'Aliyev', '+998901001003', 'bobur.aliyev@demo.uz', 'active', 'uz', null, now() - interval '72 days', now() - interval '3 days', now() - interval '110 days', now()),
  ('00000000-0000-2001-0000-000000000004', 'Nodira', 'Xasanova', '+998901001004', 'nodira.xasanova@demo.uz', 'blocked', 'uz', 'Demo: fraud signal', now() - interval '70 days', now() - interval '12 days', now() - interval '100 days', now()),
  ('00000000-0000-2001-0000-000000000005', 'Jasur', 'Toshmatov', '+998901001005', 'jasur.toshmatov@demo.uz', 'unverified', 'uz', null, null, null, now() - interval '21 days', now()),
  ('00000000-0000-2001-0000-000000000006', 'Malika', 'Yusupova', '+998901001006', 'malika.yusupova@demo.uz', 'active', 'uz', null, now() - interval '60 days', now() - interval '6 hours', now() - interval '93 days', now()),
  ('00000000-0000-2001-0000-000000000007', 'Sardor', 'Qodirov', '+998901001007', 'sardor.qodirov@demo.uz', 'active', 'uz', null, now() - interval '55 days', now() - interval '8 days', now() - interval '85 days', now()),
  ('00000000-0000-2001-0000-000000000008', 'Zulfiya', 'Mirzayeva', '+998901001008', 'zulfiya.mirzayeva@demo.uz', 'active', 'uz', null, now() - interval '50 days', now() - interval '15 minutes', now() - interval '77 days', now())
on conflict (phone) do update
set first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    status = excluded.status,
    blocked_reason = excluded.blocked_reason,
    phone_verified_at = excluded.phone_verified_at,
    last_login_at = excluded.last_login_at,
    updated_at = now();

insert into admin_users (id, email, password_hash, full_name, role, status, created_at, updated_at)
values
  ('00000000-0000-1006-0000-000000000001', 'admin@uzbron.uz', '$argon2id$v=19$m=65536,t=3,p=4$AokIMdarb3TjMvuuUgnv/g$E87tg32l3gKGSwB5THe/B9g257xCIKBBKcx0SfzkQqs', 'Demo Super Admin', 'super_admin', 'active', now(), now()),
  ('00000000-0000-1006-0000-000000000002', 'finance@uzbron.uz', '$argon2id$v=19$m=65536,t=3,p=4$kbm7j4EfsP00pB5iE1cnNg$+5/F42A64FJ0hSJTq2Zc8sZPSOAGaSu5x37PMjMAC9g', 'Demo Finance Admin', 'finance_admin', 'active', now(), now()),
  ('00000000-0000-1006-0000-000000000003', 'content@uzbron.uz', '$argon2id$v=19$m=65536,t=3,p=4$kbm7j4EfsP00pB5iE1cnNg$+5/F42A64FJ0hSJTq2Zc8sZPSOAGaSu5x37PMjMAC9g', 'Demo Content Admin', 'content_admin', 'active', now(), now())
on conflict (email) do update
set password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    role = excluded.role,
    status = excluded.status,
    updated_at = now();

insert into partner_organizations (
  id, type, legal_name, brand_name, tax_id, phone, email, city_id, address,
  status, default_commission_rate, approved_by, approved_at, rejection_reason,
  created_at, updated_at
)
values
  ('00000000-0000-3001-0000-000000000001', 'hotel', 'Grand Samarkand Hotel LLC', 'Grand Samarkand Hotel', 'DEMO-HOTEL-001', '+998901112201', 'grand.samarkand@demo.uz', '00000000-0000-1002-0000-000000000002', 'Samarqand, Registon kochasi 10', 'approved', 14.00, '00000000-0000-1006-0000-000000000001', now() - interval '30 days', null, now() - interval '160 days', now()),
  ('00000000-0000-3001-0000-000000000002', 'hotel', 'Hilton Tashkent Demo LLC', 'Hilton Tashkent', 'DEMO-HOTEL-002', '+998901112202', 'hilton.tashkent@demo.uz', '00000000-0000-1002-0000-000000000001', 'Toshkent, Amir Temur shoh kochasi 7', 'approved', 16.00, '00000000-0000-1006-0000-000000000001', now() - interval '35 days', null, now() - interval '220 days', now()),
  ('00000000-0000-3001-0000-000000000003', 'hotel', 'Buxoro Palace LLC', 'Buxoro Palace', 'DEMO-HOTEL-003', '+998901112203', 'buxoro.palace@demo.uz', '00000000-0000-1002-0000-000000000003', 'Buxoro, Mustaqillik kochasi 45', 'approved', 13.00, '00000000-0000-1006-0000-000000000001', now() - interval '20 days', null, now() - interval '145 days', now()),
  ('00000000-0000-3001-0000-000000000004', 'bus', 'Comfort Bus MChJ', 'Comfort Bus', 'DEMO-BUS-001', '+998901112301', 'comfort.bus@demo.uz', '00000000-0000-1002-0000-000000000001', 'Toshkent, Navoiy kochasi 12', 'approved', 10.00, '00000000-0000-1006-0000-000000000001', now() - interval '18 days', null, now() - interval '180 days', now()),
  ('00000000-0000-3001-0000-000000000005', 'bus', 'Express Yol LLC', 'Express Yol', 'DEMO-BUS-002', '+998901112302', 'express.yol@demo.uz', '00000000-0000-1002-0000-000000000001', 'Toshkent, Beruniy kochasi 9', 'approved', 9.00, '00000000-0000-1006-0000-000000000001', now() - interval '15 days', null, now() - interval '175 days', now()),
  ('00000000-0000-3001-0000-000000000006', 'hotel', 'Buxoro Travel MChJ', 'Buxoro Travel Hotel', 'DEMO-REQ-001', '+998934567890', 'akmal@buxorotravel.uz', '00000000-0000-1002-0000-000000000003', 'Buxoro, Mustaqillik kochasi 45', 'submitted', 12.00, null, null, null, now() - interval '1 day', now()),
  ('00000000-0000-3001-0000-000000000007', 'bus', 'Namangan Express LLC', 'Namangan Express', 'DEMO-REQ-004', '+998943216587', 'xurshid@namanganexp.uz', '00000000-0000-1002-0000-000000000006', 'Namangan, Bobur kochasi 22', 'under_review', 9.00, null, null, null, now() - interval '5 days', now())
on conflict (tax_id) do update
set type = excluded.type,
    legal_name = excluded.legal_name,
    brand_name = excluded.brand_name,
    phone = excluded.phone,
    email = excluded.email,
    city_id = excluded.city_id,
    address = excluded.address,
    status = excluded.status,
    default_commission_rate = excluded.default_commission_rate,
    approved_by = excluded.approved_by,
    approved_at = excluded.approved_at,
    rejection_reason = excluded.rejection_reason,
    updated_at = now();

insert into partner_users (id, organization_id, email, password_hash, full_name, status, created_at, updated_at)
values
  ('00000000-0000-3002-0000-000000000001', '00000000-0000-3001-0000-000000000001', 'grand.samarkand@demo.uz', '$argon2id$v=19$m=65536,t=3,p=4$kbm7j4EfsP00pB5iE1cnNg$+5/F42A64FJ0hSJTq2Zc8sZPSOAGaSu5x37PMjMAC9g', 'Grand Samarkand manager', 'active', now() - interval '160 days', now()),
  ('00000000-0000-3002-0000-000000000002', '00000000-0000-3001-0000-000000000002', 'hilton.tashkent@demo.uz', '$argon2id$v=19$m=65536,t=3,p=4$kbm7j4EfsP00pB5iE1cnNg$+5/F42A64FJ0hSJTq2Zc8sZPSOAGaSu5x37PMjMAC9g', 'Hilton Tashkent manager', 'active', now() - interval '220 days', now()),
  ('00000000-0000-3002-0000-000000000003', '00000000-0000-3001-0000-000000000004', 'comfort.bus@demo.uz', '$argon2id$v=19$m=65536,t=3,p=4$kbm7j4EfsP00pB5iE1cnNg$+5/F42A64FJ0hSJTq2Zc8sZPSOAGaSu5x37PMjMAC9g', 'Comfort Bus manager', 'active', now() - interval '180 days', now())
on conflict (organization_id, email) do update
set password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    status = excluded.status,
    updated_at = now();

insert into hotels (
  id, partner_organization_id, slug, city_id, address, latitude, longitude,
  stars, rating_average, reviews_count, status, check_in_time, check_out_time,
  cancellation_policy_id, created_at, updated_at
)
values
  ('00000000-0000-4001-0000-000000000001', '00000000-0000-3001-0000-000000000001', 'grand-samarkand-hotel', '00000000-0000-1002-0000-000000000002', 'Samarqand, Registon kochasi 10', 39.6542, 66.9597, 5, 4.70, 128, 'published', '14:00', '12:00', '00000000-0000-1005-0000-000000000001', now() - interval '150 days', now()),
  ('00000000-0000-4001-0000-000000000002', '00000000-0000-3001-0000-000000000002', 'hilton-tashkent', '00000000-0000-1002-0000-000000000001', 'Toshkent, Amir Temur shoh kochasi 7', 41.3111, 69.2797, 5, 4.90, 214, 'published', '14:00', '12:00', '00000000-0000-1005-0000-000000000001', now() - interval '210 days', now()),
  ('00000000-0000-4001-0000-000000000003', '00000000-0000-3001-0000-000000000003', 'buxoro-palace', '00000000-0000-1002-0000-000000000003', 'Buxoro, Mustaqillik kochasi 45', 39.7747, 64.4286, 4, 4.50, 89, 'published', '14:00', '12:00', '00000000-0000-1005-0000-000000000001', now() - interval '140 days', now())
on conflict (slug) do update
set partner_organization_id = excluded.partner_organization_id,
    city_id = excluded.city_id,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    stars = excluded.stars,
    rating_average = excluded.rating_average,
    reviews_count = excluded.reviews_count,
    status = excluded.status,
    updated_at = now();

insert into hotel_translations (id, hotel_id, language, name, description, created_at, updated_at)
values
  ('00000000-0000-4002-0000-000000000001', '00000000-0000-4001-0000-000000000001', 'uz', 'Grand Samarkand Hotel', 'Registon yaqinidagi 5 yulduzli demo mehmonxona.', now(), now()),
  ('00000000-0000-4002-0000-000000000002', '00000000-0000-4001-0000-000000000002', 'uz', 'Hilton Tashkent', 'Toshkent markazidagi premium demo mehmonxona.', now(), now()),
  ('00000000-0000-4002-0000-000000000003', '00000000-0000-4001-0000-000000000003', 'uz', 'Buxoro Palace', 'Buxoro markazidagi oilaviy demo mehmonxona.', now(), now())
on conflict (hotel_id, language) do update
set name = excluded.name, description = excluded.description, updated_at = now();

insert into hotel_amenities (hotel_id, amenity_id)
select hotel_id, amenity_id
from (values
  ('00000000-0000-4001-0000-000000000001'::uuid, '00000000-0000-1003-0000-000000000001'::uuid),
  ('00000000-0000-4001-0000-000000000001'::uuid, '00000000-0000-1003-0000-000000000002'::uuid),
  ('00000000-0000-4001-0000-000000000001'::uuid, '00000000-0000-1003-0000-000000000004'::uuid),
  ('00000000-0000-4001-0000-000000000002'::uuid, '00000000-0000-1003-0000-000000000001'::uuid),
  ('00000000-0000-4001-0000-000000000002'::uuid, '00000000-0000-1003-0000-000000000003'::uuid),
  ('00000000-0000-4001-0000-000000000003'::uuid, '00000000-0000-1003-0000-000000000001'::uuid),
  ('00000000-0000-4001-0000-000000000003'::uuid, '00000000-0000-1003-0000-000000000004'::uuid)
) as links(hotel_id, amenity_id)
on conflict (hotel_id, amenity_id) do nothing;

insert into hotel_rooms (
  id, hotel_id, room_type_id, code, base_occupancy, max_adults, max_children,
  total_inventory, base_price, status, created_at, updated_at
)
values
  ('00000000-0000-4003-0000-000000000001', '00000000-0000-4001-0000-000000000001', '00000000-0000-1004-0000-000000000001', 'STD-1', 2, 2, 1, 12, 650000, 'active', now(), now()),
  ('00000000-0000-4003-0000-000000000002', '00000000-0000-4001-0000-000000000001', '00000000-0000-1004-0000-000000000002', 'DLX-1', 2, 3, 1, 8, 820000, 'active', now(), now()),
  ('00000000-0000-4003-0000-000000000003', '00000000-0000-4001-0000-000000000002', '00000000-0000-1004-0000-000000000001', 'STD-2', 2, 2, 1, 15, 980000, 'active', now(), now()),
  ('00000000-0000-4003-0000-000000000004', '00000000-0000-4001-0000-000000000002', '00000000-0000-1004-0000-000000000003', 'STE-2', 2, 4, 2, 5, 1450000, 'active', now(), now()),
  ('00000000-0000-4003-0000-000000000005', '00000000-0000-4001-0000-000000000003', '00000000-0000-1004-0000-000000000001', 'STD-3', 2, 2, 1, 10, 520000, 'active', now(), now()),
  ('00000000-0000-4003-0000-000000000006', '00000000-0000-4001-0000-000000000003', '00000000-0000-1004-0000-000000000002', 'DLX-3', 2, 3, 1, 6, 710000, 'active', now(), now())
on conflict (hotel_id, code) do update
set room_type_id = excluded.room_type_id,
    total_inventory = excluded.total_inventory,
    base_price = excluded.base_price,
    status = excluded.status,
    updated_at = now();

insert into hotel_room_translations (id, room_id, language, name, description, created_at, updated_at)
values
  ('00000000-0000-4004-0000-000000000001', '00000000-0000-4003-0000-000000000001', 'uz', 'Standart', 'Qulay standart xona.', now(), now()),
  ('00000000-0000-4004-0000-000000000002', '00000000-0000-4003-0000-000000000002', 'uz', 'Deluxe', 'Keng deluxe xona.', now(), now()),
  ('00000000-0000-4004-0000-000000000003', '00000000-0000-4003-0000-000000000003', 'uz', 'Standart', 'Toshkentdagi standart xona.', now(), now()),
  ('00000000-0000-4004-0000-000000000004', '00000000-0000-4003-0000-000000000004', 'uz', 'Suite', 'Premium suite xona.', now(), now()),
  ('00000000-0000-4004-0000-000000000005', '00000000-0000-4003-0000-000000000005', 'uz', 'Standart', 'Buxoro standart xona.', now(), now()),
  ('00000000-0000-4004-0000-000000000006', '00000000-0000-4003-0000-000000000006', 'uz', 'Deluxe', 'Buxoro deluxe xona.', now(), now())
on conflict (room_id, language) do update
set name = excluded.name, description = excluded.description, updated_at = now();

insert into room_inventory (id, room_id, date, total_count, held_count, booked_count, closed, version)
select
  ('00000000-0000-4005-0000-' || lpad(((room_no * 100) + day_no)::text, 12, '0'))::uuid,
  room_id,
  current_date + day_no,
  total_count,
  0,
  day_no % 4,
  false,
  1
from (values
  (1, '00000000-0000-4003-0000-000000000001'::uuid, 12),
  (2, '00000000-0000-4003-0000-000000000002'::uuid, 8),
  (3, '00000000-0000-4003-0000-000000000003'::uuid, 15),
  (4, '00000000-0000-4003-0000-000000000004'::uuid, 5),
  (5, '00000000-0000-4003-0000-000000000005'::uuid, 10),
  (6, '00000000-0000-4003-0000-000000000006'::uuid, 6)
) as rooms(room_no, room_id, total_count)
cross join generate_series(0, 13) as day_no
on conflict (room_id, date) do update
set total_count = excluded.total_count,
    booked_count = excluded.booked_count,
    closed = excluded.closed,
    version = room_inventory.version + 1;

insert into bus_companies (id, partner_organization_id, name, status, rating_average, reviews_count, created_at, updated_at)
values
  ('00000000-0000-5001-0000-000000000001', '00000000-0000-3001-0000-000000000004', 'Comfort Bus', 'active', 4.20, 93, now() - interval '180 days', now()),
  ('00000000-0000-5001-0000-000000000002', '00000000-0000-3001-0000-000000000005', 'Express Yol', 'active', 4.00, 76, now() - interval '175 days', now())
on conflict (id) do update
set partner_organization_id = excluded.partner_organization_id,
    name = excluded.name,
    status = excluded.status,
    rating_average = excluded.rating_average,
    reviews_count = excluded.reviews_count,
    updated_at = now();

insert into vehicles (id, company_id, name, plate_number, seats_count, seat_layout, status, created_at, updated_at)
values
  ('00000000-0000-5003-0000-000000000001', '00000000-0000-5001-0000-000000000001', 'Comfort Bus Yutong ZK6122', '01 A 220 AA', 40, '{"rows":10,"columns":4,"aisleAfter":2}', 'active', now(), now()),
  ('00000000-0000-5003-0000-000000000002', '00000000-0000-5001-0000-000000000002', 'Express Yol King Long', '01 A 221 AA', 40, '{"rows":10,"columns":4,"aisleAfter":2}', 'active', now(), now())
on conflict (id) do update
set company_id = excluded.company_id,
    name = excluded.name,
    plate_number = excluded.plate_number,
    seats_count = excluded.seats_count,
    seat_layout = excluded.seat_layout,
    status = excluded.status,
    updated_at = now();

insert into routes (id, from_city_id, to_city_id, duration_minutes, created_at, updated_at)
values
  ('00000000-0000-5002-0000-000000000001', '00000000-0000-1002-0000-000000000001', '00000000-0000-1002-0000-000000000002', 250, now(), now()),
  ('00000000-0000-5002-0000-000000000002', '00000000-0000-1002-0000-000000000001', '00000000-0000-1002-0000-000000000003', 430, now(), now()),
  ('00000000-0000-5002-0000-000000000003', '00000000-0000-1002-0000-000000000002', '00000000-0000-1002-0000-000000000003', 260, now(), now())
on conflict (id) do update
set from_city_id = excluded.from_city_id,
    to_city_id = excluded.to_city_id,
    duration_minutes = excluded.duration_minutes,
    updated_at = now();

insert into trips (
  id, route_id, company_id, vehicle_id, from_city_id, to_city_id,
  departure_at, arrival_at, status, base_price, policy_snapshot, created_at, updated_at
)
values
  ('00000000-0000-5004-0000-000000000001', '00000000-0000-5002-0000-000000000001', '00000000-0000-5001-0000-000000000001', '00000000-0000-5003-0000-000000000001', '00000000-0000-1002-0000-000000000001', '00000000-0000-1002-0000-000000000002', now() + interval '1 day', now() + interval '1 day 4 hours', 'scheduled', 95000, '{"route":"Toshkent - Samarqand","baggage":"20kg included"}', now(), now()),
  ('00000000-0000-5004-0000-000000000002', '00000000-0000-5002-0000-000000000002', '00000000-0000-5001-0000-000000000002', '00000000-0000-5003-0000-000000000002', '00000000-0000-1002-0000-000000000001', '00000000-0000-1002-0000-000000000003', now() + interval '2 days', now() + interval '2 days 7 hours', 'scheduled', 145000, '{"route":"Toshkent - Buxoro","baggage":"20kg included"}', now(), now()),
  ('00000000-0000-5004-0000-000000000003', '00000000-0000-5002-0000-000000000003', '00000000-0000-5001-0000-000000000001', '00000000-0000-5003-0000-000000000001', '00000000-0000-1002-0000-000000000002', '00000000-0000-1002-0000-000000000003', now() - interval '2 days', now() - interval '2 days' + interval '4 hours', 'completed', 85000, '{"route":"Samarqand - Buxoro","baggage":"20kg included"}', now() - interval '20 days', now())
on conflict (id) do update
set route_id = excluded.route_id,
    company_id = excluded.company_id,
    vehicle_id = excluded.vehicle_id,
    departure_at = excluded.departure_at,
    arrival_at = excluded.arrival_at,
    status = excluded.status,
    base_price = excluded.base_price,
    policy_snapshot = excluded.policy_snapshot,
    updated_at = now();

insert into trip_seats (id, trip_id, seat_code, seat_class, price, status, held_by_booking_id, held_until)
select
  ('00000000-0000-5005-0000-' || lpad(((trip_no * 100) + seat_no)::text, 12, '0'))::uuid,
  trip_id,
  seat_no::text,
  'standard',
  price,
  (case when seat_no in (5, 10) then 'booked' else 'available' end)::"TripSeatStatus",
  null,
  null
from (values
  (1, '00000000-0000-5004-0000-000000000001'::uuid, 95000),
  (2, '00000000-0000-5004-0000-000000000002'::uuid, 145000),
  (3, '00000000-0000-5004-0000-000000000003'::uuid, 85000)
) as trips(trip_no, trip_id, price)
cross join generate_series(1, 12) as seat_no
on conflict (trip_id, seat_code) do update
set price = excluded.price,
    status = excluded.status,
    held_by_booking_id = null,
    held_until = null;

insert into bookings (
  id, booking_number, user_id, partner_organization_id, type, confirmation_mode,
  payment_method, status, currency, subtotal, discount_amount, bonus_amount,
  service_fee, total_amount, commission_amount, partner_payable, hotel_id, trip_id,
  partner_confirmation_deadline, expires_at, confirmed_at, cancelled_at,
  cancel_reason_text, policy_snapshot, price_snapshot, created_at, updated_at
)
values
  ('00000000-0000-6001-0000-000000000001', 'B-4501', '00000000-0000-2001-0000-000000000001', '00000000-0000-3001-0000-000000000001', 'hotel', 'instant_confirmation', 'click', 'confirmed', 'UZS', 650000, 0, 0, 0, 650000, 91000, 559000, '00000000-0000-4001-0000-000000000001', null, now() + interval '1 day', null, now() - interval '4 days', null, null, '{"cancellationPolicy":"flexible"}', '{"hotelName":"Grand Samarkand Hotel","roomType":"Standart","checkIn":"2026-07-01","checkOut":"2026-07-03","nights":2,"guests":2}', now() - interval '5 days', now()),
  ('00000000-0000-6001-0000-000000000002', 'B-4502', '00000000-0000-2001-0000-000000000002', '00000000-0000-3001-0000-000000000002', 'hotel', 'instant_confirmation', 'payme', 'completed', 'UZS', 1450000, 0, 0, 0, 1450000, 232000, 1218000, '00000000-0000-4001-0000-000000000002', null, now() + interval '1 day', null, now() - interval '10 days', null, null, '{"cancellationPolicy":"flexible"}', '{"hotelName":"Hilton Tashkent","roomType":"Suite","checkIn":"2026-06-20","checkOut":"2026-06-23","nights":3,"guests":2}', now() - interval '12 days', now()),
  ('00000000-0000-6001-0000-000000000003', 'B-4503', '00000000-0000-2001-0000-000000000003', '00000000-0000-3001-0000-000000000003', 'hotel', 'instant_confirmation', 'uzcard', 'cancelled', 'UZS', 520000, 0, 0, 0, 520000, 67600, 452400, '00000000-0000-4001-0000-000000000003', null, now() + interval '1 day', null, null, now() - interval '1 day', 'Demo: mijoz bekor qildi', '{"cancellationPolicy":"flexible"}', '{"hotelName":"Buxoro Palace","roomType":"Standart","checkIn":"2026-07-05","checkOut":"2026-07-06","nights":1,"guests":1}', now() - interval '3 days', now()),
  ('00000000-0000-6001-0000-000000000004', 'BB-3001', '00000000-0000-2001-0000-000000000006', '00000000-0000-3001-0000-000000000004', 'bus', 'instant_confirmation', 'humo', 'confirmed', 'UZS', 95000, 0, 0, 0, 95000, 9500, 85500, null, '00000000-0000-5004-0000-000000000001', now() + interval '1 day', null, now() - interval '1 day', null, null, '{"cancellationPolicy":"route policy"}', '{"companyName":"Comfort Bus","route":"Toshkent - Samarqand","seatNumber":"5"}', now() - interval '1 day', now()),
  ('00000000-0000-6001-0000-000000000005', 'BB-3002', '00000000-0000-2001-0000-000000000007', '00000000-0000-3001-0000-000000000005', 'bus', 'instant_confirmation', 'click', 'completed', 'UZS', 145000, 0, 0, 0, 145000, 14500, 130500, null, '00000000-0000-5004-0000-000000000002', now() + interval '1 day', null, now() - interval '7 days', null, null, '{"cancellationPolicy":"route policy"}', '{"companyName":"Express Yol","route":"Toshkent - Buxoro","seatNumber":"10"}', now() - interval '8 days', now()),
  ('00000000-0000-6001-0000-000000000006', 'B-4504', '00000000-0000-2001-0000-000000000008', '00000000-0000-3001-0000-000000000001', 'hotel', 'instant_confirmation', 'payme', 'awaiting_payment', 'UZS', 820000, 0, 0, 0, 820000, 114800, 705200, '00000000-0000-4001-0000-000000000001', null, now() + interval '1 day', now() + interval '2 hours', null, null, null, '{"cancellationPolicy":"flexible"}', '{"hotelName":"Grand Samarkand Hotel","roomType":"Deluxe","checkIn":"2026-07-10","checkOut":"2026-07-12","nights":2,"guests":2}', now() - interval '2 hours', now())
on conflict (booking_number) do update
set user_id = excluded.user_id,
    partner_organization_id = excluded.partner_organization_id,
    type = excluded.type,
    payment_method = excluded.payment_method,
    status = excluded.status,
    subtotal = excluded.subtotal,
    total_amount = excluded.total_amount,
    commission_amount = excluded.commission_amount,
    partner_payable = excluded.partner_payable,
    hotel_id = excluded.hotel_id,
    trip_id = excluded.trip_id,
    confirmed_at = excluded.confirmed_at,
    cancelled_at = excluded.cancelled_at,
    cancel_reason_text = excluded.cancel_reason_text,
    price_snapshot = excluded.price_snapshot,
    updated_at = now();

insert into booking_status_history (id, booking_id, status, action, actor_type, actor_id, metadata, created_at)
values
  ('00000000-0000-6002-0000-000000000001', '00000000-0000-6001-0000-000000000001', 'pending', 'created', 'system', '00000000-0000-1006-0000-000000000001', '{"bookingNumber":"B-4501"}', now() - interval '5 days'),
  ('00000000-0000-6002-0000-000000000002', '00000000-0000-6001-0000-000000000001', 'confirmed', 'status_changed', 'system', '00000000-0000-1006-0000-000000000001', '{"bookingNumber":"B-4501"}', now() - interval '4 days'),
  ('00000000-0000-6002-0000-000000000003', '00000000-0000-6001-0000-000000000003', 'cancelled', 'status_changed', 'user', '00000000-0000-2001-0000-000000000003', '{"reason":"customer_cancelled"}', now() - interval '1 day'),
  ('00000000-0000-6002-0000-000000000004', '00000000-0000-6001-0000-000000000004', 'confirmed', 'status_changed', 'system', '00000000-0000-1006-0000-000000000001', '{"bookingNumber":"BB-3001"}', now() - interval '1 day')
on conflict (id) do update
set status = excluded.status,
    action = excluded.action,
    metadata = excluded.metadata,
    created_at = excluded.created_at;

insert into payments (
  id, booking_id, provider, status, amount, currency, payment_url,
  provider_reference, idempotency_key, created_at, updated_at
)
values
  ('00000000-0000-6003-0000-000000000001', '00000000-0000-6001-0000-000000000001', 'click', 'paid', 650000, 'UZS', 'https://pay.demo.uz/B-4501', 'TXN-B-4501', 'admin-seed-payment-B-4501', now() - interval '5 days', now()),
  ('00000000-0000-6003-0000-000000000002', '00000000-0000-6001-0000-000000000002', 'payme', 'paid', 1450000, 'UZS', 'https://pay.demo.uz/B-4502', 'TXN-B-4502', 'admin-seed-payment-B-4502', now() - interval '12 days', now()),
  ('00000000-0000-6003-0000-000000000003', '00000000-0000-6001-0000-000000000003', 'uzcard', 'refunded', 520000, 'UZS', 'https://pay.demo.uz/B-4503', 'TXN-B-4503', 'admin-seed-payment-B-4503', now() - interval '3 days', now()),
  ('00000000-0000-6003-0000-000000000004', '00000000-0000-6001-0000-000000000004', 'humo', 'paid', 95000, 'UZS', 'https://pay.demo.uz/BB-3001', 'TXN-BB-3001', 'admin-seed-payment-BB-3001', now() - interval '1 day', now()),
  ('00000000-0000-6003-0000-000000000005', '00000000-0000-6001-0000-000000000006', 'payme', 'pending', 820000, 'UZS', 'https://pay.demo.uz/B-4504', 'TXN-B-4504', 'admin-seed-payment-B-4504', now() - interval '2 hours', now())
on conflict (idempotency_key) do update
set booking_id = excluded.booking_id,
    provider = excluded.provider,
    status = excluded.status,
    amount = excluded.amount,
    provider_reference = excluded.provider_reference,
    updated_at = now();

insert into refunds (id, booking_id, user_id, status, requested_amount, approved_amount, currency, reason, created_at, updated_at)
values
  ('00000000-0000-6005-0000-000000000001', '00000000-0000-6001-0000-000000000003', '00000000-0000-2001-0000-000000000003', 'approved', 520000, 468000, 'UZS', 'Demo cancelled booking refund', now() - interval '1 day', now())
on conflict (id) do update
set status = excluded.status,
    requested_amount = excluded.requested_amount,
    approved_amount = excluded.approved_amount,
    reason = excluded.reason,
    updated_at = now();

insert into partner_ledger_entries (id, organization_id, booking_id, type, amount, currency, created_at)
values
  ('00000000-0000-6004-0000-000000000001', '00000000-0000-3001-0000-000000000001', '00000000-0000-6001-0000-000000000001', 'booking_payable', 559000, 'UZS', now() - interval '5 days'),
  ('00000000-0000-6004-0000-000000000002', '00000000-0000-3001-0000-000000000002', '00000000-0000-6001-0000-000000000002', 'booking_payable', 1218000, 'UZS', now() - interval '12 days'),
  ('00000000-0000-6004-0000-000000000003', '00000000-0000-3001-0000-000000000004', '00000000-0000-6001-0000-000000000004', 'booking_payable', 85500, 'UZS', now() - interval '1 day')
on conflict (id) do update
set organization_id = excluded.organization_id,
    booking_id = excluded.booking_id,
    amount = excluded.amount,
    created_at = excluded.created_at;

insert into withdrawal_requests (id, organization_id, amount, currency, status, created_at, updated_at)
values
  ('00000000-0000-7002-0000-000000000001', '00000000-0000-3001-0000-000000000001', 12500000, 'UZS', 'requested', now() - interval '2 days', now()),
  ('00000000-0000-7002-0000-000000000002', '00000000-0000-3001-0000-000000000003', 8400000, 'UZS', 'approved', now() - interval '5 days', now()),
  ('00000000-0000-7002-0000-000000000003', '00000000-0000-3001-0000-000000000004', 4200000, 'UZS', 'rejected', now() - interval '1 day', now())
on conflict (id) do update
set organization_id = excluded.organization_id,
    amount = excluded.amount,
    status = excluded.status,
    updated_at = now();

insert into reviews (id, user_id, booking_id, target_type, target_id, rating, body, status, created_at, updated_at)
values
  ('00000000-0000-7001-0000-000000000001', '00000000-0000-2001-0000-000000000001', '00000000-0000-6001-0000-000000000001', 'hotel', '00000000-0000-4001-0000-000000000001', 5, 'Joylashuv juda qulay.', 'published', now() - interval '4 days', now()),
  ('00000000-0000-7001-0000-000000000002', '00000000-0000-2001-0000-000000000002', '00000000-0000-6001-0000-000000000002', 'hotel', '00000000-0000-4001-0000-000000000002', 5, 'Xizmat darajasi yuqori.', 'published', now() - interval '8 days', now()),
  ('00000000-0000-7001-0000-000000000003', '00000000-0000-2001-0000-000000000006', '00000000-0000-6001-0000-000000000004', 'bus_company', '00000000-0000-5001-0000-000000000001', 4, 'Avtobus toza va vaqtida keldi.', 'published', now() - interval '1 day', now())
on conflict (id) do update
set rating = excluded.rating,
    body = excluded.body,
    status = excluded.status,
    updated_at = now();

insert into support_tickets (id, user_id, subject, priority, status, created_at, updated_at)
values
  ('00000000-0000-7003-0000-000000000001', '00000000-0000-2001-0000-000000000001', 'Tolov otmadi', 'high', 'open', now() - interval '2 hours', now()),
  ('00000000-0000-7003-0000-000000000002', '00000000-0000-2001-0000-000000000002', 'Bronni bekor qilish', 'low', 'closed', now() - interval '3 days', now()),
  ('00000000-0000-7003-0000-000000000003', '00000000-0000-2001-0000-000000000003', 'Xona malumoti mos kelmadi', 'medium', 'in_progress', now() - interval '1 day', now())
on conflict (id) do update
set subject = excluded.subject,
    priority = excluded.priority,
    status = excluded.status,
    updated_at = now();

insert into support_messages (id, ticket_id, sender_type, sender_id, body, created_at)
values
  ('00000000-0000-7004-0000-000000000001', '00000000-0000-7003-0000-000000000001', 'user', '00000000-0000-2001-0000-000000000001', 'Payme orqali tolov qildim, lekin bron tasdiqlanmadi.', now() - interval '2 hours'),
  ('00000000-0000-7004-0000-000000000002', '00000000-0000-7003-0000-000000000001', 'admin', '00000000-0000-1006-0000-000000000001', 'Chekni tekshiryapmiz, tez orada javob beramiz.', now() - interval '90 minutes'),
  ('00000000-0000-7004-0000-000000000003', '00000000-0000-7003-0000-000000000002', 'user', '00000000-0000-2001-0000-000000000002', 'Bronni bekor qilmoqchiman.', now() - interval '3 days'),
  ('00000000-0000-7004-0000-000000000004', '00000000-0000-7003-0000-000000000002', 'admin', '00000000-0000-1006-0000-000000000001', 'Bron bekor qilindi.', now() - interval '2 days')
on conflict (id) do update
set sender_type = excluded.sender_type,
    body = excluded.body,
    created_at = excluded.created_at;

insert into cms_entries (id, type, slug, title, body, status, metadata, published_at, created_at, updated_at)
values
  ('00000000-0000-7005-0000-000000000001', 'banner', 'summer-discount', '{"uz":"Yozgi tatil uchun 20% chegirma"}', '{"uz":"Yozgi promo banner."}', 'published', '{"imageUrl":"/images/banners/summer.jpg","link":"/offers/summer","order":1}', now() - interval '3 days', now(), now()),
  ('00000000-0000-7005-0000-000000000002', 'banner', 'samarkand-bus', '{"uz":"Samarqandga avtobus qatnovi"}', '{"uz":"Samarqand yo nalishi banner."}', 'published', '{"imageUrl":"/images/banners/samarkand.jpg","link":"/buses/samarkand","order":2}', now() - interval '2 days', now(), now()),
  ('00000000-0000-7005-0000-000000000003', 'news', 'yangi-mehmonxonalar-iyun', '{"uz":"Yangi mehmonxonalar qoshildi"}', '{"uz":"Platformaga yangi hamkor mehmonxonalar qoshildi."}', 'published', '{"category":"news"}', now() - interval '2 days', now(), now()),
  ('00000000-0000-7005-0000-000000000004', 'page', 'about', '{"uz":"Biz haqimizda"}', '{"uz":"UzBron haqida demo sahifa."}', 'published', '{"menu":"footer"}', now() - interval '100 days', now(), now()),
  ('00000000-0000-7005-0000-000000000005', 'promo', 'summer20', '{"uz":"SUMMER20"}', '{"uz":"20 foiz chegirma promo kodi."}', 'published', '{"discountType":"percent","discountValue":20,"usageLimit":100,"usedCount":45}', now() - interval '1 day', now(), now()),
  ('00000000-0000-7005-0000-000000000006', 'promo', 'welcome50', '{"uz":"WELCOME50"}', '{"uz":"50000 som chegirma promo kodi."}', 'published', '{"discountType":"fixed","discountValue":50000,"usageLimit":500,"usedCount":82}', now() - interval '1 day', now(), now())
on conflict (type, slug) do update
set title = excluded.title,
    body = excluded.body,
    status = excluded.status,
    metadata = excluded.metadata,
    published_at = excluded.published_at,
    updated_at = now();

insert into audit_logs (
  id, actor_type, actor_id, action, entity_type, entity_id,
  old_value, new_value, metadata, ip_address, user_agent, request_id, created_at
)
values
  ('00000000-0000-7006-0000-000000000001', 'admin', '00000000-0000-1006-0000-000000000001', 'user_registered', 'users', '00000000-0000-2001-0000-000000000001', null, '{"message":"Anvar Karimov royxatdan otdi"}', '{"source":"admin-seed"}', '127.0.0.1', 'seed', 'seed-1', now() - interval '20 minutes'),
  ('00000000-0000-7006-0000-000000000002', 'admin', '00000000-0000-1006-0000-000000000001', 'booking_created', 'bookings', '00000000-0000-6001-0000-000000000001', null, '{"message":"Bron yaratildi"}', '{"source":"admin-seed"}', '127.0.0.1', 'seed', 'seed-2', now() - interval '15 minutes'),
  ('00000000-0000-7006-0000-000000000003', 'admin', '00000000-0000-1006-0000-000000000001', 'partner_request', 'partner_organizations', '00000000-0000-3001-0000-000000000006', null, '{"message":"Yangi hamkor arizasi"}', '{"source":"admin-seed"}', '127.0.0.1', 'seed', 'seed-3', now() - interval '10 minutes'),
  ('00000000-0000-7006-0000-000000000004', 'admin', '00000000-0000-1006-0000-000000000001', 'complaint', 'support_tickets', '00000000-0000-7003-0000-000000000001', null, '{"message":"Yangi shikoyat"}', '{"source":"admin-seed"}', '127.0.0.1', 'seed', 'seed-4', now() - interval '5 minutes')
on conflict (id) do update
set action = excluded.action,
    entity_type = excluded.entity_type,
    entity_id = excluded.entity_id,
    new_value = excluded.new_value,
    metadata = excluded.metadata,
    created_at = excluded.created_at;

insert into notifications (id, user_id, owner_type, owner_id, title, body, read_at, created_at)
values
  ('00000000-0000-7007-0000-000000000001', '00000000-0000-2001-0000-000000000001', 'user', '00000000-0000-2001-0000-000000000001', 'Bron tasdiqlandi', 'B-4501 broningiz tasdiqlandi.', null, now() - interval '1 day'),
  ('00000000-0000-7007-0000-000000000002', '00000000-0000-2001-0000-000000000002', 'user', '00000000-0000-2001-0000-000000000002', 'Promo kod', 'SUMMER20 promo kodidan foydalaning.', now() - interval '1 hour', now() - interval '2 days')
on conflict (id) do update
set title = excluded.title,
    body = excluded.body,
    read_at = excluded.read_at,
    created_at = excluded.created_at;

commit;
