# Life Dashboard

**Görevler, alışkanlıklar, dersler, yemek ve spor takibi için kişisel yaşam yönetim paneli.**

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)

---

## Özellikler

### Görevler & Alışkanlıklar
- Alt görevler (checklist)
- Tekrarlayan görevler (günlük/haftalık)
- Etiket filtreleme ve sıralama
- Alışkanlık hedefleri (örn. haftada 5 gün)
- Streak istatistikleri (en uzun seri, ortalama seri)
- Tamamlama oranı ve en iyi günler analizi

### Özel Dersler
- Ders takvimi ve planlama
- Tekrarlayan ders şablonları
- Öğrenci profilleri (notlar, iletişim, veli bilgileri)
- Gelir/gider takibi
- Aylık fatura ve Excel/PDF rapor

### Yemek & Tarifler
- Tarif kaydetme (malzemeler, yapılış, süre, porsiyon)
- Yemek günlüğü (kahvaltı, öğle, akşam, ara öğün)
- Tariften hızlı yemek ekleme

### Spor & Sağlık
- Antrenman takibi (koşu, yüzme, fitness, yoga vb.)
- Su ve kahve tüketim takibi
- Haftalık su grafiği

### İstatistikler & Raporlar
- Dashboard özet kartları
- Etiketlere göre görev dağılımı
- Bu ay vs geçen ay karşılaştırma
- Haftalık/aylık PDF rapor

### Diğer
- PWA desteği — ana ekrana eklenebilir, offline çalışır
- Mobil uyumlu, çentikli ekran desteği
- Koyu/açık tema
- Veri yedekleme ve geri yükleme (JSON)

---

## Teknolojiler

- **React 19** + **Vite 7**
- **Tailwind CSS**
- **Lucide React** (ikonlar)
- **xlsx** (Excel export)
- **vite-plugin-pwa** (Progressive Web App)

---

## Kurulum

```bash
# Depoyu klonla
git clone https://github.com/KULLANICI_ADINIZ/life-dashboard.git
cd life-dashboard

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini açın.

---

## Build & Deploy

```bash
# Production build
npm run build

# Build önizleme
npm run preview
```

**Vercel / Netlify:** Repoyu bağlayıp otomatik deploy edebilirsiniz. Detaylar için [DEPLOY.md](./DEPLOY.md) dosyasına bakın.

---

## Proje Yapısı

```
life-dashboard/
├── src/
│   ├── components/     # UI bileşenleri
│   │   ├── layout/     # Layout, sayfa yapıları
│   │   └── widgets/    # Dashboard widget'ları
│   ├── contexts/       # React Context (global state)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Yardımcı fonksiyonlar
│   └── constants/      # Sabitler
├── public/
└── dist/               # Build çıktısı
```

---

## Veri & Gizlilik

Tüm veriler **localStorage**'da tutulur. Sunucuya veri gönderilmez. Yedek almak için Profil sayfasındaki "Yedekle" butonunu kullanabilirsiniz.

---

## Lisans

MIT License — İstediğiniz gibi kullanabilir, değiştirebilir ve paylaşabilirsiniz.

---

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açarak tartışmayı öneririz.
