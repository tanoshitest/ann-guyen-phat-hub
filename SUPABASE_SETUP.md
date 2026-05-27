# Supabase Demo Setup

Huong dan nay dung de luu du lieu demo va test logic tren app AN NGUYEN PHAT CRM.

## 1. Tao project Supabase

1. Vao https://supabase.com
2. Dang nhap hoac tao tai khoan
3. Bam `New project`
4. Dat ten project, vi du: `an-nguyen-phat-crm`
5. Cho Supabase tao xong project

## 2. Tao bang demo

1. Trong Supabase, mo project vua tao
2. Vao menu `SQL Editor`
3. Bam `New query`
4. Copy toan bo noi dung file `supabase/schema.sql`
5. Dan vao SQL Editor
6. Bam `Run`

Bang duoc tao ten la `demo_records`.

## 3. Lay URL va anon key

1. Trong Supabase, vao `Project Settings`
2. Vao `API`
3. Copy `Project URL`
4. Copy `anon public` key

## 4. Cau hinh tren Vercel

1. Vao Vercel project
2. Vao `Settings`
3. Vao `Environment Variables`
4. Them 2 bien:

```txt
VITE_SUPABASE_URL=Project URL cua Supabase
VITE_SUPABASE_ANON_KEY=anon public key cua Supabase
```

5. Bam `Save`
6. Vao tab `Deployments`
7. Bam redeploy ban moi nhat

## 5. Test

1. Mo app tren Vercel
2. Vao `Mua hang`, `Ban hang`, `Van chuyen`, hoac `Chi phi`
3. Bam `Them moi`
4. Nhap thong tin va bam `Luu`
5. Refresh trang
6. Neu dong vua tao van con, Supabase da luu thanh cong

Trang `Hoa don` va `Cong no` cung se luu thay doi trang thai khi Supabase da duoc cau hinh.

## Ghi chu

- Neu chua cau hinh Supabase, app van chay bang mock data nhu hien tai.
- Day la setup demo de test logic, chua phai database ke toan chuan hoa cuoi cung.
- Khong dua `service_role key` len Vercel frontend. Chi dung `anon public key`.
