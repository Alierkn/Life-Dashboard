# Proje Analiz Raporu: Kritik Sorunlar ve Tespitler

Bu rapor, Life Dashboard projesinin mevcut kod tabanı üzerinde yapılan detaylı inceleme sonucunda oluşturulmuştur. Özellikle backend senkronizasyon mekanizması, veri güvenliği ve mimari yapısal sorunlara odaklanılmıştır.

## 🚨 1. Kritik Backend ve Veritabanı Senkronizasyon Sorunları

En kritik tespitler bu alandadır. Mevcut yapı veri kaybı riski taşımakta ve ölçeklenebilir değildir.

### 1.1. "Hepsini Sil ve Yeniden Ekle" (Delete-All-Insert-All) Stratejisi
`api/sync.js` dosyasındaki `POST` işlemi, gelen veriyi veritabanına kaydetmek için **önce ilgili kullanıcının tüm verilerini silmekte**, ardından request body'sindeki verileri **tekrar eklemektedir**.

*   **Risk:** Eğer `DELETE` işlemi başarılı olur ancak `INSERT` işlemi sırasında (örneğin ağ hatası veya veritabanı kesintisi nedeniyle) bir hata oluşursa, **kullanıcının tüm verileri kalıcı olarak silinir.**
*   **Performans:** Her senkronizasyonda tüm tabloyu silip tekrar yazmak, veri büyüdükçe (özellikle `dersler` ve `log` tabloları) veritabanı üzerinde gereksiz yük oluşturur ve işlemi yavaşlatır.
*   **Özel Dersler Etkisi:** Kullanıcı geçmişe dönük 100 ders kaydı tutuyorsa, yeni bir ders eklediğinde sistem 101 dersi silip tekrar yazar. Bu işlem sırasında bağlantı koparsa tüm ders geçmişi kaybolabilir.

### 1.2. Yarış Durumu (Race Condition) ve Veri Ezilmesi
Birden fazla cihaz (örneğin telefon ve bilgisayar) aynı anda senkronizasyon yapmaya çalışırsa ciddi sorunlar oluşur.

*   **Senaryo:**
    1.  Cihaz A veriyi çeker (v1).
    2.  Cihaz B veriyi çeker (v1).
    3.  Cihaz A yeni bir ders ekler ve gönderir (v2). Sunucu veriyi v2 olarak günceller.
    4.  Cihaz B başka bir alışkanlık işaretler ve kendi versiyonunu (v1 + işaretleme) gönderir.
    5.  **Sonuç:** Cihaz B, Cihaz A'nın eklediği dersi bilmediği için, sunucuya gönderdiği veri paketinde o ders yoktur. Sunucu Cihaz B'nin verisini "doğru" kabul edip v2'nin üzerine yazar. **Cihaz A'nın eklediği ders silinir.**

### 1.3. Çatışma Çözümü (Conflict Resolution) Eksikliği
Sistemde "en son değişikliği birleştirme" (merge) mekanizması yoktur. Sunucu, gelen veriyi körü körüne kabul eder. Verinin hangi cihazdan ne zaman geldiğine dair bir zaman damgası (timestamp) kontrolü veya versiyonlama (optimistic locking) bulunmamaktadır.

---

## 🔒 2. Güvenlik Açıkları

### 2.1. Zayıf Kimlik Doğrulama (Device ID)
Sistem, kullanıcıları sadece `X-Device-ID` (UUID) başlığı ile tanımlamaktadır.

*   **Sorun:** Bu ID ele geçirilirse veya tahmin edilirse, kötü niyetli bir kişi ilgili kullanıcının tüm verilerine erişebilir ve silebilir. Gerçek bir oturum yönetimi (JWT, OAuth vb.) yoktur.
*   **LocalStorage:** Bu ID tarayıcının `localStorage` alanında saklanır ve XSS açıklarına karşı savunmasızdır.

### 2.2. Sunucu Tarafı Doğrulama Eksikliği
Backend (`api/sync.js`), gelen verinin içeriğini (örneğin ders ücretinin negatif olup olmadığı, metin alanlarının uzunluğu vb.) detaylı olarak doğrulamaz. Frontend doğrulaması aşılırsa veritabanına bozuk veri kaydedilebilir.

---

## 🏗️ 3. Frontend Mimarisi ve Kod Kalitesi

### 3.1. React Anti-Pattern: Render İçinde Side Effect
`src/contexts/AppContext.jsx` dosyasında şu satır bulunmaktadır:

```javascript
// AppContext.jsx:180
getSyncPayloadRef.current = getSyncPayload;
```

Bu atama işlemi, bileşen her render edildiğinde çalışır (render phase). React dokümantasyonuna göre render aşamasında `ref` güncellemeleri veya yan etkiler (side effects) yapılmamalıdır. Bu durum beklenmedik buglara ve React'in Concurrent Mode gibi özellikleriyle uyumsuzluğa yol açabilir.

### 3.2. Monolitik State Yönetimi (`AppContext`)
Tüm uygulama durumu (alışkanlıklar, görevler, dersler, ayarlar, tema vb.) tek bir `AppContext` içinde tutulmaktadır.

*   **Performans:** `lessons` dizisine bir eleman eklendiğinde, sadece derslerle ilgilenen bileşenler değil, `AppContext`'i kullanan **tüm uygulama** (örneğin sayaç bileşeni) yeniden render edilebilir.
*   **Bakım:** 700+ satırlık bir Context dosyası yönetimi zorlaştırır. State'in mantıksal parçalara (UserContext, DataContext, UIContext vb.) bölünmesi gerekir.

### 3.3. Karmaşık `useEffect` Bağımlılıkları
`AppContext.jsx` içindeki senkronizasyon mantığı (`useEffect` blokları), `pendingPushRef`, `skipNextApplyRef` gibi birçok flag (bayrak) değişkenine dayanmaktadır. Bu yapı, asenkron işlemlerin (fetch/push) durumunu yönetmeyi zorlaştırır ve "neden verim güncellenmedi?" gibi hataların takibini güçleştirir.

---

## 🐛 4. Diğer Teknik Bulgular

*   **Lint Hataları:** Kod tabanında `eslint` çalıştırıldığında birçok hata görülmektedir (kullanılmayan değişkenler, `useEffect` bağımlılık dizisi eksikleri). Özellikle `App.jsx` içinde `useCallback` bağımlılıklarında eksikler (`setIsImporting` vb.) mevcuttur. Bu, fonksiyonların eski state değerlerini (stale closure) kullanmasına neden olabilir.
*   **Hardcoded SQL:** `api/sync.js` içinde SQL sorguları doğrudan kodun içine gömülmüştür. Bu durum sorguların yönetimini ve okunabilirliğini azaltır. Veritabanı katmanının (Repository pattern veya ayrı fonksiyonlar) ayrılması daha temiz olacaktır.
*   **Hata Yönetimi:** API tarafında oluşan hatalar (`try-catch`), kullanıcıya detaylı bilgi vermeden sadece 500 kodu ile dönmektedir. Kullanıcı "Senkronizasyon Hatası" aldığında sebebini (internet mi, sunucu mu, veri formatı mı) anlayamaz.

---

## ✅ Özet ve Öncelikli Öneriler

Mevcut haliyle proje, tek kullanıcılı ve tek cihazlı kullanım için çalışabilir durumdadır ancak **production (canlı) ortam için ciddi riskler taşımaktadır.**

1.  **Acil:** `api/sync.js` içindeki "Hepsini Sil - Yeniden Ekle" mantığı, "Upsert" (Varsa Güncelle, Yoksa Ekle) mantığına dönüştürülmelidir.
2.  **Acil:** Veri güncellemeleri için zaman damgası (timestamp) kontrolü eklenerek, eski verinin yeniyi ezmesi engellenmelidir.
3.  **Önemli:** `AppContext` yapısı refactor edilmeli, state yönetimi parçalara ayrılmalı veya `Redux Toolkit` / `TanStack Query` gibi daha yetenekli kütüphaneler kullanılmalıdır.
