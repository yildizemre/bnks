# Görseller

Panelde görsel gösterilen her yer bu klasördeki dosyaları okur. Dosya yoksa panel,
beklenen dosya yolunu yazan bir yer tutucu gösterir; aynı adla dosyayı koymanız yeterli.
Önerilen format: `.jpg`, 16:9 (kamera kareleri için 1280×720).

| Klasör | Dosyalar | Nerede görünür |
| --- | --- | --- |
| `logo/` | `logo.png` | Kaynak logo. Panelin kullandığı kırpılmış kopyaları `public/brand/` altında |
| `login/` | `hero.jpg` | Giriş ekranının sol tarafı |
| `banko-guvenligi/` | `banko1..5.png` (orijinal) → panel `banko1..5.jpg` web kopyalarını kullanır | Nakit ve Banko Güvenliği: alarmlar, banko kartları, modül banner'ı |
| `atm-resimler/` | `atm1..5.png` (orijinal) → panel `atm1..5.jpg` kopyalarını kullanır. 1 levye, 2 sprey boya, 3 sahipsiz paket, 4 matkap, 5 barınma | ATM bildirimleri, ATM kabin kartları, modül banner'ı |
| `operasyonel/` | `oper1..5.png` (orijinal) → panel `oper1..5.jpg` kopyalarını kullanır. 1 bekleme KPI aşımı, 2 gişe boş, 3 uzun etkileşim, 4 yoğunluk artışı, 5 KPI eşiği yaklaşıyor | Operasyonel bildirimler, modül banner'ı (oper5) |
| `dolandiricilik/` | `dolandir1..5.png` (orijinal) → panel `dolandir1..5.jpg` kopyalarını kullanır. 1 ve 4: KL-0192, 2 ve 5: KL-0187, 3: kimliksiz eşleşme | Dolandırıcılık bildirimleri, modül banner'ı (dolandir4) |
| `blacklist/` | `person-1.jpg` (KL-0192) ve `person-2.jpg` (KL-0187) dolandırıcılık karelerinden kırpıldı; `person-3..6.jpg` boş | Kara liste tablosu ve eşleşme detayındaki referans fotoğraf |
| `kameralar/` | `giriskamerasi*.png`, `giriskamera3.png`, `beklemealani.png`, `beklemealani1.png` → panel `.jpg` kopyalarını kullanır (`beklemealani2` = `beklemealani` ile aynı dosya, kullanılmıyor) | Kameralar sayfası (giriş/bekleme); gişe, banko ve ATM kameraları ilgili modül karelerini kullanır; Müşteri İçgörüsü banner'ı (beklemealani1) |
| `subeler/` | `sube1..6.png` (orijinal) → panel `sube1..6.jpg` kopyalarını kullanır. Sıra: Ataşehir, Kadıköy, Ümraniye, Üsküdar, Kartal, Levent | Şubeler sayfası kartları |
| `avatars/` | `user-1..3.jpg` (kare) | Kullanıcı avatarları |

Bildirim şablonları ve hangi görseli kullandıkları: `src/data/alarms.ts` → `alarmTemplates`.
Görseli olmayan bildirim türü tutulmaz; yeni bir tür eklerken önce görselini bu klasörlere koyun.
