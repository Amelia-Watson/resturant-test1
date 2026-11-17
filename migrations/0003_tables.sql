alter table orders add column if not exists table_no integer;

create index if not exists orders_table_no_idx on orders (table_no);
