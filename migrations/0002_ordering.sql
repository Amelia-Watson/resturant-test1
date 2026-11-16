create table if not exists menu_items (
  id text primary key,
  name text not null,
  blurb text not null,
  price_cents integer not null,
  category text not null,
  available boolean not null default true,
  sort integer not null default 0
);

create table if not exists orders (
  code text primary key,
  items text not null,
  total_cents integer not null,
  note text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

insert into menu_items (id, name, blurb, price_cents, category, sort) values
  ('half-chicken', 'Half chicken', 'Charred lemon, rosemary, browned butter.', 2400, 'Plates', 1),
  ('pappardelle', 'Rye pappardelle', 'Brown butter, sage, pecorino.', 2100, 'Plates', 2),
  ('fennel', 'Citrus fennel', 'Blood orange, pistachio, olive oil.', 1400, 'Garden', 3),
  ('broccolini', 'Charred broccolini', 'Chili, garlic, lemon zest.', 1100, 'Garden', 4),
  ('ricotta', 'Herb ricotta toast', 'Grilled sourdough, chili honey.', 1200, 'Bread', 5),
  ('chocolate', 'Dark chocolate pot', 'Flaky salt, warm cream.', 900, 'Sweets', 6),
  ('cake', 'Olive oil cake', 'Orange peel, barely sweet.', 800, 'Sweets', 7),
  ('cooler', 'Rosemary cooler', 'Sparkling citrus, crushed ice.', 600, 'Sips', 8)
on conflict (id) do nothing;
