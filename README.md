Gölge Rotalar — Basit Web Taslak

Bu dizin, "Gölge Rotalar (Shadow Routes)" için ödev olarak hazırlanmış temel bir site iskeleti içerir.

İçerik
- `index.html` — Ana sayfa; tam ekran video hero, menü, öne çıkan rotalar ön izleme.
- `vision.html` — Vizyon ve Hedef Kitle açıklamaları (ödev maddeleri 2).
- `css/styles.css` — Basit stil dosyası (karanlık tema, renk paleti).
- `js/main.js` — Giriş butonu etkileşimleri ve küçük yardımcı kodlar.
- `assets/logo.svg` — Basit logo mockup (SVG).
 - `assets/hero-poster.svg` — Hero poster placeholder (SVG).
 - `assets/route1.svg`, `assets/route2.svg`, `assets/route3.svg` — Rota görsel placeholder'ları (SVG). Yerlerine kendi fotoğraflarını yavaş yavaş koyabilirsin.

Renk paleti
- Koyu zemin: #0b0b0d
- Vurgu (koyu kırmızı): #b91c1c
- Antik altın: #b88f3b
- Kart arka plan: #111214

Tipografi
- Başlıklar: Cinzel (Google Fonts)
- Gövde metni: Inter (Google Fonts)

Yerel olarak nasıl çalıştırılır
1) Bir terminal/powershell açın ve proje dizinine gidin:

   cd "c:\Users\bugra\OneDrive\Desktop\Seyahatacentası"

2) Basit bir HTTP sunucusu ile çalıştırın (Python yüklü ise):

   python -m http.server 8000

Ardından tarayıcıda http://localhost:8000 açın.

Video ve görseller
- `assets/hero.mp4` ve `assets/hero-poster.jpg` yok ise, video boş kalır ve poster görüntüsü gösterilir. Kendi atmosferik videolarınızı koyun veya telifsiz kaynaklardan alın.
 - `assets/hero.mp4` yok ise, video boş kalır; `assets/hero-poster.svg` placeholder'a sahiptir. Kendi atmosferik videolarınızı koyun veya telifsiz kaynaklardan alın.

Erişilebilirlik ve Notlar
- Video otomatik başlatma için `muted` gereklidir.
- Gelecek geliştirmeler: mobil menü (hamburger), SEO meta açıklamaları, gerçek içerik (rutin, fiyatlama), rezervasyon akışı ve blog altyapısı.

İleride yapılacaklar (öneri)
- Rota detay sayfaları (dinamik içerik)
- Rehber profilleri ve rezervasyon sistemine entegrasyon
- Basit bir CMS veya statik-site jeneratörü ile içerik yönetimi

Hazırlayan: Proje taslağı — Öğrenci ödevi tarzı demo

Optimizasyon notları
- Bu projede hızlı yükleme için örnek olarak bazı optimize edilmiş JPG varyantları oluşturuldu (assets klasöründe): `route1-400.jpg`, `route1-800.jpg`, `route1-1200.jpg` (aynı mantıkla `route2-*`, `route3-*`) ve `hero-poster-800.jpg`, `hero-poster-1600.jpg`.
- Sayfa `data-srcset`/`sizes` ile responsive görseller kullanır; ayrıca lazy-load (IntersectionObserver) mevcut.
- Daha küçük dosyalar ve modern tarayıcı desteği için WebP üretimi yapılabilir — istersen bunu da otomatikleştiririm (Python veya Node.js tabanlı araç kullanılarak).

Yayınlama (GitHub Pages)
1) Git deposu oluşturup commit/ push yap

   git init
   git add .
   git commit -m "Initial site: Gölge Rotalar"
   git branch -M main
   git remote add origin https://github.com/<kullaniciadi>/<repo>.git
   git push -u origin main

2) GitHub'da repository ayarlarından Pages bölümüne gidip siteyi "GitHub Actions" veya "gh-pages" ile yayınlayabilirsin. Bu projede bir GitHub Actions workflow (`.github/workflows/pages.yml`) eklendi; push ettiğinde otomatik deploy tetiklenecektir.

3) Notlar ve tavsiyeler
 - Büyük medya dosyalarını (100MB üzeri) repoya koyma; gerekiyorsa Git LFS kullan veya medyayı bir CDN'e taşı.
 - `LICENSE` olarak MIT eklendi; farklı bir lisans istersen değiştirebilirsin.
 - Gizli bilgi (API anahtarı, özel erişim tokenleri vb.) hiçbir dosyada yok. GitHub'da yayınlarken bu tür bilgileri .env veya GitHub Secrets olarak sakla.

