# Life Dashboard — Gelişmiş Geliştirme Yol Haritası (v2.0)

> Bu doküman, Life Dashboard projesinin teknik borçlarını temizlemek, mimari yapısını güçlendirmek ve yeni nesil özellikler eklemek için oluşturulan kapsamlı bir yol haritasıdır.

---

## 🏗️ Mimari & Teknik Refactoring (Altyapı İyileştirme)

### **Faz 1: Backend & Veri Güvenliği (Kritik - Hemen)**
- ✅ **Güvenli Senkronizasyon (Upsert):** `api/sync.js` içindeki "Hepsini Sil - Yeniden Ekle" mantığı, "Varsa Güncelle, Yoksa Ekle" (Upsert) yapısına dönüştürüldü.
- [ ] **Delete Missing Handling:** Silinen verilerin tespiti için ID karşılaştırma mantığı iyileştirilmeli (kısmen yapıldı).
- [ ] **Input Validation (Backend):** `zod` veya `joi` kütüphaneleri ile backend'e gelen verinin şema kontrolü yapılmalı. (Negatif ders ücreti, bozuk JSON vb. engellemek için).
- [ ] **Rate Limiting:** `upstash/ratelimit` kullanarak aynı IP'den gelen aşırı istekler engellenmeli.

### **Faz 2: Frontend State Yönetimi (Yüksek Öncelik)**
- [ ] **Context Parçalama (Code Splitting):**
  - Mevcut `AppContext` çok büyük (God Object).
  - Şuna bölünmeli: `UserContext` (Auth, Profil), `HabitContext` (Alışkanlıklar), `LessonContext` (Dersler), `UIContext` (Tema, Layout).
- [ ] **Performans Optimizasyonu:**
  - `useMemo` ve `useCallback` kullanımı yaygınlaştırılmalı.
  - Ağır hesaplamalar (istatistikler) `Web Worker` içine taşınabilir.
  - Gereksiz render'ları önlemek için `React.memo` stratejik kullanılmalı.
- [ ] **React Query (TanStack Query):**
  - Veri çekme (fetching) ve cache yönetimi için `useEffect` yerine `useQuery` kullanılmalı.
  - Bu sayede "loading", "error" ve "background refetch" durumları otomatik yönetilir.

---

## 🛡️ Güvenlik İyileştirmeleri

### **Faz 3: Kimlik Doğrulama & Yetkilendirme (Orta Öncelik)**
- [ ] **Device ID Validasyonu:**
  - Şu anki UUID kontrolü yeterli değil. Tarayıcı parmak izi (fingerprinting) veya JWT tabanlı basit bir anonim oturum eklenebilir.
- [ ] **Veri Şifreleme:**
  - Hassas veriler (öğrenci telefonları, notlar) veritabanında şifreli (encrypted) saklanabilir.
- [ ] **Secure Headers:**
  - `helmet` benzeri yapılarla HTTP güvenlik başlıkları (CSP, X-Frame-Options) eklenmeli.

---

## ✨ Yeni Özellikler (Feature Roadmap)

### **Faz 4: Gelişmiş Senkronizasyon & Çoklu Cihaz (Orta-Uzun Vade)**
- [ ] **Conflict Resolution (Çatışma Çözümü):**
  - İki cihaz aynı anda veri değiştirdiğinde "Son Değiştiren Kazanır" (Last Write Wins) yerine, kullanıcıya "Hangi versiyonu saklayalım?" sorusu sorulmalı.
  - Veritabanına `updated_at` (timestamp) sütunu eklenerek versiyon kontrolü yapılmalı.
- [ ] **Offline-First Mimari:**
  - İnternet yokken yapılan değişiklikler bir kuyruğa (Queue) alınmalı ve bağlantı geldiğinde sırayla gönderilmeli (`redux-offline` veya `workbox-background-sync`).

### **Faz 5: Raporlama & Analitik (Uzun Vade)**
- [ ] **Gelişmiş Grafikler:**
  - `recharts` veya `chart.js` ile detaylı gelir/gider, alışkanlık başarı oranı grafikleri.
- [ ] **PDF/Excel Export Geliştirmesi:**
  - Şu anki JSON yedeği yerine, okunabilir formatta (Aylık Ders Raporu PDF) çıktı alabilme.
- [ ] **AI Destekli İçgörüler:**
  - OpenAI/Claude API entegrasyonu ile: "Bu hafta su içmeyi ihmal ettin, geçen haftaya göre %20 düşüş var" gibi akıllı uyarılar.

---

## 📅 Örnek Sprint Planı (Teknik Borç Öncelikli)

**Sprint 1 (Hemen - 1 Hafta):**
- [ ] `api/sync.js` Input Validation (Zod entegrasyonu).
- [ ] `AppContext` içindeki gereksiz `useEffect` temizliği.
- [ ] Lint hatalarının tamamen temizlenmesi.

**Sprint 2 (2 Hafta):**
- [ ] `TanStack Query` kurulumu ve `fetchSync` fonksiyonunun buna taşınması.
- [ ] Backend Conflict Resolution (Timestamp) altyapısının kurulması.

**Sprint 3 (2 Hafta):**
- [ ] `AppContext`'in parçalanması (`UserContext`, `LessonContext` vb.).
- [ ] Mobil uyumluluk (PWA) iyileştirmeleri (Splash screen, icon fix).

---

*Bu plan, projenin ölçeklenebilirliği ve veri güvenliği öncelik alınarak güncellenmiştir.*
