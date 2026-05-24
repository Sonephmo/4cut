-- Haesol 4cut: Supabase 테이블 + Storage + RLS (대시보드 SQL 에디터에서 실행)
-- Realtime: Database > Replication 에서 print_jobs 활성화

-- 1) 테이블
create table if not exists public.print_jobs (
  id              uuid primary key default gen_random_uuid(),
  file_path       text not null,
  status          text not null default 'pending',
  copies          int not null default 1 check (copies >= 1 and copies <= 99),
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists print_jobs_file_path_key on public.print_jobs (file_path);

-- Realtime (이미 등록되어 있으면 대시보드 Replication에서만 확인)
-- alter publication supabase_realtime add table public.print_jobs;

-- 2) RLS
alter table public.print_jobs enable row level security;

-- 웹앱(anon): 작업 등록 + 상태 조회(폴링)
create policy "print_jobs_anon_insert"
  on public.print_jobs for insert
  to anon
  with check (true);

create policy "print_jobs_anon_select"
  on public.print_jobs for select
  to anon
  using (true);

-- authenticated 역할도 동일하게 사용할 경우
create policy "print_jobs_authenticated_insert"
  on public.print_jobs for insert
  to authenticated
  with check (true);

create policy "print_jobs_authenticated_select"
  on public.print_jobs for select
  to authenticated
  using (true);

-- service_role 키는 RLS 우회 (프린터 앱)

-- 3) Storage 버킷 (대시보드 Storage에서 생성해도 됨: 이름 photos, Public)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = excluded.public;

-- Storage 정책: anon 업로드/읽기 (프린터 앱은 service_role로 다운로드)
create policy "photos_anon_upload"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'photos');

create policy "photos_anon_read"
  on storage.objects for select
  to anon
  using (bucket_id = 'photos');

create policy "photos_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "photos_auth_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos');

-- 상태 값: pending | printing | done | failed
