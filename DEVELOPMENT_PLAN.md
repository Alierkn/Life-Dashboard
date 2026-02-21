# Life Dashboard — Kapsamlı Geliştirme Planı

> Bu doküman, Life Dashboard projesinin kısa, orta ve uzun vadeli geliştirme yol haritasını içerir.

---

## 📋 Mevcut Durum Özeti

### Var Olan Özellikler
- ✅ Alışkanlık takibi (günlük/haftalık/aylık) + seri sayacı
- ✅ Görev listesi (etiketler, tamamlama)
- ✅ Hedef takibi (ilerleme çubukları)
- ✅ Pomodoro zamanlayıcı (odak + mola)
- ✅ AI Yaşam Koçu (duruma göre ipuçları)
- ✅ Aktivite ısı haritası (8 hafta)
- ✅ XP & seviye sistemi
- ✅ Dark mode (class stratejisi)
- ✅ Özelleştirilebilir widget layout
- ✅ Veri dışa/içe aktarma (JSON)
- ✅ Profil sayfası & istatistikler

### Teknik Yapı
- **Stack:** React 19 + Vite 7 + Tailwind CSS 3
- **State:** useState/useEffect, LocalStorage
- **Mimari:** Tek dosya (App.jsx ~870 satır)

---

## 🗺️ Geliştirme Fazları

---

## FAZ 1: Temel İyileştirmeler (1–2 Hafta)

### 1.1 Kod Kalitesi & Refactoring
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 1 | Yardımcı fonksiyonları ayır | Yüksek | `utils/date.js`, `utils/storage.js` gibi modüllere taşı |
| 2 | Sabitleri merkezileştir | Orta | XP değerleri, localStorage key'leri, varsayılan veriler için `constants.js` |
| 3 | Kullanılmayan importları temizle | Düşük | Trophy, Clock, Zap, Calendar, Flag, Award kaldır |
| 4 | ESLint kurallarını sıkılaştır | Orta | `exhaustive-deps` vb. kurallar ekle |

### 1.2 Hata Düzeltmeleri
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 5 | `generateAiTip` bağımlılık uyarısı | Yüksek | useEffect dependency array'ini düzelt veya `useCallback` kullan |
| 6 | Ceza sistemi useEffect | Yüksek | `setHabits` içinde `setUserStats` çağrısı — state güncellemesi sırası kontrolü |
| 7 | Hedef `current` güncelleme | Orta | Kullanıcının hedef ilerlemesini manuel artırabilmesi için UI ekle |
| 8 | Boş hedef target = 0 | Orta | `goal.target === 0` durumunda yüzde hesaplaması hatası önle |

### 1.3 UX İyileştirmeleri
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 9 | Mobil header | Yüksek | "Profil" ve "Düzenle" butonları mobilde gizli — hamburger menü veya alt navigasyon |
| 10 | Toast/notification süresi | Orta | Bildirimler otomatik kapanma (örn. 5 sn) |
| 11 | Boş durum mesajları | Düşük | Daha motive edici boş state metinleri |
| 12 | Yükleme durumu | Orta | Import/export sırasında loading göstergesi |

---

## FAZ 2: Modüler Mimari (2–3 Hafta)

### 2.1 Bileşen Ayrıştırma
| # | Görev | Öncelik | Hedef Dosya |
|---|-------|---------|--------------|
| 13 | Header bileşeni | Yüksek | `components/Header.jsx` |
| 14 | Widget bileşenleri | Yüksek | `components/widgets/WelcomeWidget.jsx`, `TimerWidget.jsx`, vb. |
| 15 | Layout bileşeni | Yüksek | `components/DashboardLayout.jsx`, `ProfileLayout.jsx` |
| 16 | Ortak UI bileşenleri | Orta | `components/ui/Button.jsx`, `Card.jsx`, `Modal.jsx` |

### 2.2 State Yönetimi
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 17 | Custom hooks | Yüksek | `useHabits`, `useTasks`, `useGoals`, `useTimer`, `useTheme` |
| 18 | Context API | Orta | `AppContext` — theme, userStats, layout paylaşımı |
| 19 | LocalStorage hook | Orta | `useLocalStorage` — tekrarlayan persist mantığını merkezileştir |

### 2.3 Proje Yapısı
```
src/
├── components/
│   ├── layout/
│   ├── widgets/
│   └── ui/
├── hooks/
├── utils/
├── constants/
├── contexts/
├── App.jsx
└── main.jsx
```

---

## FAZ 3: Yeni Özellikler (3–4 Hafta)

### 3.1 Alışkanlık & Görev Geliştirmeleri
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 20 | Alışkanlık hatırlatıcıları | Yüksek | Belirli saatte bildirim (örn. "Erken Kalk" 07:00) |
| 21 | Görev öncelik sıralaması | Orta | `priority` alanına göre sıralama ve görselleştirme |
| 22 | Görev tarih/deadline | Orta | Görevlere bitiş tarihi ekleme |
| 23 | Alışkanlık düzenleme | Orta | Mevcut alışkanlığı düzenleme modalı |
| 24 | Görev düzenleme | Orta | Mevcut görevi düzenleme |

### 3.2 Hedef & İlerleme
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 25 | Hedef ilerleme güncelleme | Yüksek | `+` butonu ile manuel artırma |
| 26 | Hedef tamamlama kutlama | Orta | Animasyonlu tamamlama modalı |
| 27 | Haftalık/aylık özet | Orta | "Bu hafta X alışkanlık tamamlandı" özeti |

### 3.3 Zamanlayıcı & AI
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 28 | Özel mola süresi | Orta | 5 dk yerine kullanıcı tanımlı mola |
| 29 | Zamanlayıcı sesleri | Düşük | Tamamlandığında ses efekti |
| 30 | AI ipuçları genişletme | Orta | Daha fazla senaryo ve kişiselleştirilmiş mesajlar |

### 3.4 Veri & Yedekleme
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 31 | Otomatik yedekleme | Orta | Haftalık LocalStorage snapshot |
| 32 | Veri doğrulama (import) | Orta | JSON şema kontrolü, hata mesajları |
| 33 | Çoklu profil | Düşük | Farklı kullanıcı profilleri (localStorage namespace) |

---

## FAZ 4: Kalite & UX (2 Hafta)

### 4.1 Erişilebilirlik (a11y)
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 34 | Klavye navigasyonu | Yüksek | Tab, Enter, Escape ile tüm etkileşimler |
| 35 | ARIA etiketleri | Yüksek | `aria-label`, `role`, `aria-live` |
| 36 | Odak yönetimi | Orta | Modal açıldığında focus trap |
| 37 | Renk kontrastı | Orta | WCAG AA uyumluluğu |

### 4.2 Performans
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 38 | Lazy loading | Orta | Profil sayfası ve widget'lar için `React.lazy` |
| 39 | Debounce/throttle | Düşük | Sık tetiklenen state güncellemeleri |
| 40 | Bundle analizi | Düşük | `vite-bundle-visualizer` ile boyut kontrolü |

### 4.3 Test
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 41 | Vitest kurulumu | Orta | `npm install -D vitest @testing-library/react` |
| 42 | Yardımcı fonksiyon testleri | Orta | `getTodayString`, `getDaysBetween` vb. |
| 43 | Bileşen testleri | Düşük | Kritik widget'lar için unit test |

### 4.4 Animasyonlar
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 44 | Sayfa geçişleri | Düşük | Dashboard ↔ Profil arası geçiş animasyonu |
| 45 | Widget ekleme/çıkarma | Düşük | Layout düzenlemede yumuşak geçişler |
| 46 | Başarı animasyonları | Düşük | Alışkanlık/görev tamamlandığında mikro-animasyon |

---

## FAZ 5: İleri Seviye (4+ Hafta)

### 5.1 Backend & Senkronizasyon
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 47 | Supabase/Firebase entegrasyonu | Yüksek | Verileri bulutta saklama |
| 48 | Kullanıcı kimlik doğrulama | Yüksek | Email/şifre veya OAuth |
| 49 | Çoklu cihaz senkronizasyonu | Orta | Aynı hesapta farklı cihazlardan erişim |

### 5.2 PWA & Mobil
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 50 | PWA manifest | Orta | `vite-plugin-pwa` ile offline destek |
| 51 | Service Worker | Orta | Cache stratejisi, offline çalışma |
| 52 | Ana ekrana ekleme | Düşük | Mobil "Add to Home Screen" desteği |

### 5.3 Gelişmiş Özellikler
| # | Görev | Öncelik | Açıklama |
|---|-------|---------|----------|
| 53 | Gerçek AI entegrasyonu | Düşük | OpenAI/Claude API ile dinamik ipuçları |
| 54 | Takvim görünümü | Düşük | Aylık takvimde alışkanlık/görev özeti |
| 55 | İstatistik grafikleri | Orta | Chart.js veya Recharts ile trend grafikleri |
| 56 | Çoklu dil (i18n) | Düşük | react-i18next ile TR/EN desteği |

---

## 📊 Öncelik Matrisi

```
Yüksek Öncelik (Hemen):  #5, #6, #9, #13–16, #17, #20, #25, #34, #35
Orta Öncelik (1–2 ay):  #1–4, #7–8, #10–12, #18–19, #21–22, #26–29, #31–32, #36–37, #41–42, #47–48, #55
Düşük Öncelik (İleride): #23–24, #30, #33, #38–40, #43–46, #50–54, #56
```

---

## 🛠️ Önerilen Araçlar

| Kategori | Araç | Açıklama |
|----------|------|----------|
| State | Zustand veya Jotai | Hafif global state (Context yerine) |
| Form | React Hook Form | Görev/alışkanlık ekleme formları |
| Tarih | date-fns | Zaten kullanılıyor — `toISOString` yerine |
| Test | Vitest + Testing Library | Vite ile uyumlu |
| PWA | vite-plugin-pwa | Workbox tabanlı |
| Backend | Supabase | Auth + Realtime + Storage |

---

## 📅 Örnek Sprint Planı (2 Haftalık)

**Sprint 1:**
- #5, #6 (hata düzeltmeleri)
- #9 (mobil header)
- #1 (utils ayrıştırma)
- #13 (Header bileşeni)

**Sprint 2:**
- #14 (widget bileşenleri)
- #17 (custom hooks)
- #25 (hedef ilerleme güncelleme)
- #34 (klavye navigasyonu)

---

*Bu plan canlı bir dokümandır. Proje ilerledikçe güncellenebilir.*
