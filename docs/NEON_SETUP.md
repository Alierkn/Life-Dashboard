# Neon Kurulum Adımları

## 1. neonctl init tamamla

Terminalde `npx neonctl@latest init` çalışıyorsa:
- "Which editor(s)..." sorusunda **Enter** ile geç veya Cursor seç
- Proje oluşturulunca **connection string** verilecek

## 2. .env dosyası

Proje kökünde `.env` oluştur:

```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

(neonctl init genelde bunu otomatik ekler)

## 3. Schema'yı Neon'a yükle

Neon Console → SQL Editor'da `scripts/neon-schema.sql` içeriğini çalıştır.

Veya CLI ile:
```bash
npx neonctl sql --file scripts/neon-schema.sql
```

## 4. Migration (task_logs count sütunu)

Eğer schema zaten çalıştırıldıysa, SQL Editor'da şunu çalıştır:

```sql
ALTER TABLE task_logs ADD COLUMN IF NOT EXISTS count integer DEFAULT 1;
```

## 5. Bağlantı testi

API'yi test etmek için `vercel dev` kullan (Vite + API birlikte):

```bash
vercel dev
```

Tarayıcıda: `http://localhost:3000/api/health`

Beklenen: `{"ok":true,"db":"connected"}`

## 6. Vercel deploy

Vercel Dashboard → Project → Settings → Environment Variables:
- `DATABASE_URL` = Neon connection string (Production, Preview, Development)

Deploy sonrası: `https://your-app.vercel.app/api/health` test et.

## 7. Cihazlar arası senkronizasyon

Veriler Neon'da `device_id` ile saklanır. Telefon ve bilgisayarda aynı veriyi görmek için:

1. **Bilgisayarda:** Profil → Cihaz kodunu kopyala
2. **Telefonda:** Profil → Cihaz kodu yapıştır → Eşle

Her iki cihaz aynı `device_id` kullanacak ve veriler senkronize olacak.
