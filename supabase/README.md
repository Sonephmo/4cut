# Supabase 설정

1. [schema.sql](./schema.sql) 내용을 **SQL Editor**에서 실행합니다.
2. **Database → Replication**에서 `print_jobs` 테이블이 Realtime에 포함되어 있는지 확인합니다. (없으면 테이블 추가)
3. **Storage**에서 `photos` 버킷이 없으면 생성하고 **Public bucket**으로 둡니다.
4. 웹앱: 프로젝트 루트 `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정.
5. 프린터 PC: [printer-app/.env.example](../printer-app/.env.example) 참고해 `SUPABASE_SERVICE_ROLE_KEY` 사용 (절대 프론트에 노출 금지).
