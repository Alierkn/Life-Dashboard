# Life Dashboard — Canlı Yayına Alma Rehberi

Bu rehber, uygulamanızı internete yayınlayıp telefonunuzdan erişmeniz için adım adım talimatlar içerir.

---

## Adım 1: GitHub’a Yükleme

### 1.1 GitHub hesabı
- [github.com](https://github.com) adresinden ücretsiz hesap oluşturun (yoksa).

### 1.2 Git kurulumu
```bash
# Git kurulu değilse: https://git-scm.com/downloads
git --version
```

### 1.3 Projeyi GitHub’a yükleme
```powershell
cd "c:\Users\alier\Desktop\Clude Denemeleri\Proje 3\life-dashboard"

# Git deposu (henüz yoksa)
git init

# Tüm dosyaları ekle (.gitignore zaten node_modules ve dist içeriyor)
git add .
git commit -m "Life Dashboard - ilk commit"

# GitHub'da yeni repo oluştur: github.com → New repository → "life-dashboard" adı
# Sonra (KULLANICI_ADINIZ yerine kendi GitHub kullanıcı adınızı yazın):
git remote add origin https://github.com/KULLANICI_ADINIZ/life-dashboard.git
git branch -M main
git push -u origin main
```

---

## Adım 2: Vercel ile deploy

### 2.1 Vercel hesabı
- [vercel.com](https://vercel.com) adresinden ücretsiz hesap oluşturun.
- “Continue with GitHub” ile GitHub hesabınızı bağlayın.

### 2.2 Proje import
1. Vercel Dashboard → **Add New** → **Project**
2. GitHub reponuzu seçin: `life-dashboard`
3. **Root Directory:** Boş bırakın (repo root zaten life-dashboard)
4. **Framework Preset:** Vite (otomatik algılanır)
5. **Build Command:** `npm run build` (varsayılan)
6. **Output Directory:** `dist` (varsayılan)
7. **Deploy** butonuna tıklayın.

### 2.3 Sonuç
- Birkaç dakika sonra `https://life-dashboard-xxx.vercel.app` benzeri bir adres alacaksınız.
- Bu adres her zaman açık ve erişilebilir olacaktır.

---

## Adım 3: Telefonda kullanım

### 3.1 Tarayıcıdan erişim
- Telefonunuzda tarayıcıyı açın.
- Vercel’deki adresi (örn. `https://life-dashboard-xxx.vercel.app`) yazın.
- Uygulama mobil uyumlu olarak açılacaktır.

### 3.2 Ana ekrana ekleme (PWA)
**Android (Chrome):**
1. Tarayıcıda siteyi açın.
2. Menü (⋮) → **“Ana ekrana ekle”** veya **“Uygulamayı yükle”**.
3. Uygulama ana ekrana eklenir; uygulama gibi açılır.

**iPhone (Safari):**
1. Safari’de siteyi açın.
2. Paylaşım simgesi → **“Ana Ekrana Ekle”**.
3. Uygulama ana ekrana eklenir.

---

## Alternatif: Netlify ile deploy

1. [netlify.com](https://netlify.com) → Ücretsiz hesap oluşturun.
2. **Add new site** → **Import an existing project** → GitHub.
3. Repo: `life-dashboard`
4. Build: `npm run build` | Publish: `dist`
5. **Deploy** butonuna tıklayın.

---

## Alternatif: Yerel ağda test (Telefon)

Bilgisayarınızda çalışırken telefonunuzdan aynı WiFi’de test etmek için:

```bash
cd "c:\Users\alier\Desktop\Clude Denemeleri\Proje 3\life-dashboard"
npm run dev
```

Vite çıktısında şuna benzer bir satır görürsünüz:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

- Telefonunuzda tarayıcıyı açın.
- `http://192.168.x.x:5173` adresine gidin (IP adresinizi kullanın).
- Telefon ve bilgisayar aynı WiFi’de olmalı.

---

## Mobil uyumluluk

Uygulama şunları içerir:
- **PWA:** Ana ekrana eklenebilir, uygulama gibi açılır.
- **Offline:** Temel veriler cache’lenir.
- **Safe area:** Çentikli ekranlarda düzgün görünüm.
- **Responsive:** Mobil ve masaüstü uyumlu.

---

## Özel domain (isteğe bağlı)

Vercel’de:
1. Project → **Settings** → **Domains**
2. Kendi domaininizi ekleyin (örn. `lifedashboard.com`).
3. DNS ayarlarını Vercel’in talimatlarına göre yapın.

---

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Build hatası | `npm run build` komutunu proje klasöründe çalıştırıp kontrol edin. |
| Veri kaybolmuyor | Veriler `localStorage`’da tutulur; tarayıcı/cihaz değişince sıfırlanır. |
| Mobilde yavaş | İlk yüklemede normal; sonra cache’ler devreye girer. |
