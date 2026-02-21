# Veritabanı Alternatifleri — Hareketsizlik Politikası Karşılaştırması

Supabase ücretsiz projeleri **7 gün hareketsizlikten** sonra duraklatıyor. Daha rahat seçenekler:

---

## Hareketsizlik Politikası Karşılaştırması

| Servis | Hareketsizlik | Ne Olur? | Uyanma |
|--------|---------------|----------|--------|
| **Supabase** | 7 gün | Proje duraklar | Dashboard'dan manuel |
| **Neon** | Kısa süre | Scale to zero (suspend) | **Otomatik** — ilk istekte uyanır (~500ms) |
| **PlanetScale** | 30 gün | Veritabanı uyur | Dashboard'dan manuel |
| **Turso** | 10 gün | Arşivlenir | CLI ile `unarchive` |
| **Firebase** | **Yok** | Kullanım bazlı, duraklama yok | — |
| **PocketBase** | **Yok** | Self-hosted, siz kontrol edersiniz | — |

---

## Önerilen Seçenekler (Hareketsizlik Açısından Rahat)

### 1. Firebase Firestore — En Rahat (Managed)

- **Hareketsizlik politikası yok** — proje duraklamaz
- 1GB ücretsiz storage
- Günlük: 50K read, 20K write
- Auth, Realtime dahil
- NoSQL (koleksiyon/doküman yapısı)

**Life Dashboard için:** Veri modeli JSON'a uygun, kolay geçiş.

---

### 2. Neon — "Soğuk Başlangıç" Ama Otomatik Uyanır

- **Scale to zero** — kullanılmadığında suspend
- **İlk istekte otomatik uyanır** (~500ms gecikme)
- Veri kaybı yok, manuel müdahale gerekmez
- PostgreSQL (Supabase ile aynı SQL)
- 0.5GB storage, 50 saat compute/ay

**Life Dashboard için:** Supabase'e benzer, sadece client değişir. Kullanıcı uygulamayı açınca DB otomatik uyanır.

---

### 3. PocketBase — Tam Kontrol (Self-Hosted)

- **Kimse duraklatmaz** — kendi sunucunuz
- Tek dosya (~12MB), SQLite tabanlı
- Auth, Realtime, dosya storage dahil
- Ücretsiz hosting: Railway, Render, Fly.io, Oracle Cloud Always Free

**Life Dashboard için:** Biraz daha kurulum gerekir ama tam kontrol sizde.

---

### 4. PlanetScale — 30 Gün (Daha Uzun Süre)

- **30 gün** hareketsizlikten sonra uyur
- 5GB ücretsiz
- MySQL (Supabase'den farklı)
- Uyandırmak için dashboard'dan tıklama gerekir

---

## Özet Öneri

| Kullanım | Öneri |
|----------|-------|
| **Hiç uğraşmak istemiyorum, duraklama olmasın** | **Firebase** |
| **PostgreSQL istiyorum, kısa gecikme kabul** | **Neon** |
| **Tam kontrol, self-host** | **PocketBase** |
| **30 gün yeterli** | PlanetScale |

---

## Firebase'e Geçiş (Özet)

Firebase seçilirse:
- `firebase` paketi + Firestore
- Auth: Email/şifre, Google
- Veri: `users/{userId}/habits`, `users/{userId}/tasks` vb.
- Realtime listener ile anlık senkron

Schema Supabase'den farklı (NoSQL) ama mevcut JSON yapınız zaten uyumlu.
