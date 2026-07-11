-- Add columns for homepage data (frontend TODO: deals, popular-cities, partners-showcase, featured hotels)

-- Cities: add slug, image_url, sort_order for popular-cities
alter table cities
  add column if not exists slug varchar(255),
  add column if not exists image_url text,
  add column if not exists sort_order integer not null default 0;

create unique index if not exists cities_slug_key on cities (slug);

-- PartnerOrganizations: add logo_url, showcase for partners-showcase
alter table partner_organizations
  add column if not exists logo_url text,
  add column if not exists showcase boolean not null default false;

-- Hotels: add featured flag
alter table hotels
  add column if not exists featured boolean not null default false;

create index if not exists hotels_featured_idx on hotels (featured) where featured = true;

-- Seed: update cities with slug + image_url
update cities set slug = 'toshkent',   image_url = '/images/cities/tashkent.jpg',   sort_order = 1  where name ->> 'uz' = 'Toshkent';
update cities set slug = 'samarqand',  image_url = '/images/cities/samarkand.jpg',  sort_order = 2  where name ->> 'uz' = 'Samarqand';
update cities set slug = 'buxoro',     image_url = '/images/cities/bukhara.jpg',    sort_order = 3  where name ->> 'uz' = 'Buxoro';
update cities set slug = 'xiva',       image_url = '/images/cities/khiva.jpg',      sort_order = 4  where name ->> 'uz' = 'Xiva';
update cities set slug = 'fargona',    image_url = '/images/cities/fergana.jpg',    sort_order = 5  where name ->> 'uz' = 'Farg''ona';
update cities set slug = 'namangan',   image_url = '/images/cities/namangan.jpg',   sort_order = 6  where name ->> 'uz' = 'Namangan';

-- Seed: update partner_organizations with logo_url and showcase
update partner_organizations set logo_url = '/images/partners/grand-samarkand.png',  showcase = true  where brand_name = 'Grand Samarkand Hotel';
update partner_organizations set logo_url = '/images/partners/hilton-tashkent.png',  showcase = true  where brand_name = 'Hilton Tashkent';
update partner_organizations set logo_url = '/images/partners/buxoro-palace.png',    showcase = true  where brand_name = 'Buxoro Palace';

-- Seed: mark all published hotels as featured
update hotels set featured = true where status = 'published';

-- Seed: add offer entries to cms_entries (so GET /cms/offers returns real data)
insert into cms_entries (id, type, slug, title, body, status, metadata, published_at, created_at, updated_at)
values
  ('00000000-0000-7005-0000-000000000007', 'offer', 'samarkand-plaza-deal',
   '{"uz":"Samarkand Plaza","ru":"Samarkand Plaza","en":"Samarkand Plaza"}',
   '{"uz":"Registon maydoni yaqinidagi ajoyib mehmonxona. 30% chegirma bilan band qiling!","ru":"Прекрасный отель рядом с площадью Регистан. Забронируйте со скидкой 30%!","en":"A wonderful hotel near Registon Square. Book with 30% off!"}',
   'published',
   '{"hotel_id":"00000000-0000-4001-0000-000000000001","slug":"grand-samarkand-hotel","city_name":{"uz":"Samarqand","ru":"Самарканд","en":"Samarkand"},"image_url":"/images/hotels/samarkand-plaza.jpg","old_price":45000000,"new_price":31500000,"discount_percent":30,"ends_at":"2026-07-20T23:59:59Z"}',
   now() - interval '3 days', now(), now()),
  ('00000000-0000-7005-0000-000000000008', 'offer', 'hilton-tashkent-deal',
   '{"uz":"Hilton Tashkent","ru":"Hilton Tashkent","en":"Hilton Tashkent"}',
   '{"uz":"Toshkent markazidagi premium mehmonxona. 20% chegirma!","ru":"Премиум отель в центре Ташкента. Скидка 20%!","en":"Premium hotel in central Tashkent. 20% discount!"}',
   'published',
   '{"hotel_id":"00000000-0000-4001-0000-000000000002","slug":"hilton-tashkent","city_name":{"uz":"Toshkent","ru":"Ташкент","en":"Tashkent"},"image_url":"/images/hotels/hilton-tashkent.jpg","old_price":65000000,"new_price":52000000,"discount_percent":20,"ends_at":"2026-07-25T23:59:59Z"}',
   now() - interval '2 days', now(), now()),
  ('00000000-0000-7005-0000-000000000009', 'offer', 'buxoro-palace-deal',
   '{"uz":"Buxoro Palace","ru":"Buxoro Palace","en":"Buxoro Palace"}',
   '{"uz":"Buxoro markazidagi oilaviy mehmonxona. 25% chegirma bilan!","ru":"Семейный отель в центре Бухары. Со скидкой 25%!","en":"Family hotel in central Bukhara. With 25% off!"}',
   'published',
   '{"hotel_id":"00000000-0000-4001-0000-000000000003","slug":"buxoro-palace","city_name":{"uz":"Buxoro","ru":"Бухара","en":"Bukhara"},"image_url":"/images/hotels/buxoro-palace.jpg","old_price":38000000,"new_price":28500000,"discount_percent":25,"ends_at":"2026-07-22T23:59:59Z"}',
   now() - interval '1 day', now(), now())
on conflict (type, slug) do update
set title = excluded.title,
    body = excluded.body,
    status = excluded.status,
    metadata = excluded.metadata,
    published_at = excluded.published_at,
    updated_at = now();
