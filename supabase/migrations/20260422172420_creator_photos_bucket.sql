insert into storage.buckets (id, name, public)
values ('creator-photos', 'creator-photos', true)
on conflict (id) do nothing;

create policy "Anyone can read creator photos"
on storage.objects for select
using (bucket_id = 'creator-photos');

create policy "Creators can upload own photo"
on storage.objects for insert
with check (
  bucket_id = 'creator-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Creators can update own photo"
on storage.objects for update
using (
  bucket_id = 'creator-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
