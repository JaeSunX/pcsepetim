-- Full SQL export including seed data
-- Generated: 2026-04-08T18:03:24.677Z
SET FOREIGN_KEY_CHECKS=0;

-- Prisma schema based MySQL DDL
-- Generated from prisma/schema.prisma

CREATE TABLE `kullanicilar` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `sifre` varchar(255) NOT NULL,
  `ad` varchar(255) NOT NULL,
  `telefon` varchar(255) DEFAULT NULL,
  `sehir` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `biyografi` text,
  `olusturma` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `guncelleme` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `doping_paketler` (
  `id` varchar(255) NOT NULL,
  `ad` varchar(255) NOT NULL,
  `aciklama` text NOT NULL,
  `fiyat` double NOT NULL,
  `gun` int NOT NULL,
  `vitrin` tinyint(1) NOT NULL DEFAULT 0,
  `anasayfa` tinyint(1) NOT NULL DEFAULT 0,
  `renkliYazi` tinyint(1) NOT NULL DEFAULT 0,
  `kalinYazi` tinyint(1) NOT NULL DEFAULT 0,
  `populer` tinyint(1) NOT NULL DEFAULT 0,
  `renk` varchar(255) NOT NULL DEFAULT 'blue',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ilanlar` (
  `id` varchar(255) NOT NULL,
  `baslik` varchar(255) NOT NULL,
  `aciklama` text NOT NULL,
  `fiyat` double NOT NULL,
  `kategori` varchar(255) NOT NULL,
  `altKategori` varchar(255) DEFAULT NULL,
  `resimler` text NOT NULL,
  `durum` varchar(255) NOT NULL DEFAULT 'AKTIF',
  `sehir` varchar(255) NOT NULL,
  `ilce` varchar(255) DEFAULT NULL,
  `vitrin` tinyint(1) NOT NULL DEFAULT 0,
  `anasayfaPin` tinyint(1) NOT NULL DEFAULT 0,
  `renkliYazi` tinyint(1) NOT NULL DEFAULT 0,
  `kalinYazi` tinyint(1) NOT NULL DEFAULT 0,
  `dopingBitis` datetime(3) DEFAULT NULL,
  `kullaniciId` varchar(255) NOT NULL,
  `goruntuleme` int NOT NULL DEFAULT 0,
  `olusturma` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `guncelleme` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ilanlar_durum_idx` (`durum`),
  KEY `ilanlar_kategori_idx` (`kategori`),
  KEY `ilanlar_sehir_idx` (`sehir`),
  KEY `ilanlar_kullaniciId_idx` (`kullaniciId`),
  KEY `ilanlar_olusturma_idx` (`olusturma`),
  KEY `ilanlar_vitrin_dopingBitis_idx` (`vitrin`,`dopingBitis`),
  KEY `ilanlar_anasayfaPin_dopingBitis_idx` (`anasayfaPin`,`dopingBitis`),
  CONSTRAINT `ilanlar_kullaniciId_fkey` FOREIGN KEY (`kullaniciId`) REFERENCES `kullanicilar` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `odemeler` (
  `id` varchar(255) NOT NULL,
  `ilanId` varchar(255) NOT NULL,
  `kullaniciId` varchar(255) NOT NULL,
  `paketId` varchar(255) NOT NULL,
  `tutar` double NOT NULL,
  `durum` varchar(255) NOT NULL DEFAULT 'TAMAMLANDI',
  `olusturma` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `odemeler_ilanId_idx` (`ilanId`),
  CONSTRAINT `odemeler_ilanId_fkey` FOREIGN KEY (`ilanId`) REFERENCES `ilanlar` (`id`),
  CONSTRAINT `odemeler_kullaniciId_fkey` FOREIGN KEY (`kullaniciId`) REFERENCES `kullanicilar` (`id`),
  CONSTRAINT `odemeler_paketId_fkey` FOREIGN KEY (`paketId`) REFERENCES `doping_paketler` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- -----------------------------------------------------
-- Seed data for table `doping_paketler`
-- -----------------------------------------------------
INSERT INTO `doping_paketler` (`id`, `ad`, `aciklama`, `fiyat`, `gun`, `vitrin`, `anasayfa`, `renkliYazi`, `kalinYazi`, `populer`, `renk`) VALUES
('paket-one-cikar', 'Öne Çıkar', 'İlanın kategori sayfasında üstte çıksın, renkli ve kalın yazı ile dikkat çeksin.', 39.99, 3, 0, 0, 1, 1, 0, 'blue'),
('paket-vitrin', 'Vitrin', 'İlanın vitrin bölümünde gösterilir, altın çerçeve ve özel rozet ile öne çıkar.', 79.99, 7, 1, 0, 1, 1, 1, 'amber'),
('paket-anasayfa', 'Anasayfa', 'İlanın ana sayfanın en üstünde sabitlenir, milyonlarca kullanıcıya ulaşır.', 129.99, 7, 0, 1, 1, 1, 0, 'purple'),
('paket-super', 'Süper Doping', 'Tüm doping özellikleri bir arada! Vitrin + Anasayfa + Öne Çıkar. Maksimum görünürlük.', 199.99, 15, 1, 1, 1, 1, 0, 'pink')
;

-- -----------------------------------------------------
-- Seed data for table `kullanicilar`
-- -----------------------------------------------------
INSERT INTO `kullanicilar` (`id`, `email`, `sifre`, `ad`, `telefon`, `sehir`, `biyografi`) VALUES
('kullanici-demo', 'demo@teknoel.com', '$2a$10$hMfhsl3CgRNNYUDOQdoDDODNLkBRjLB821KxJGhwIsX3aXgTBKbIK', 'Demo Kullanıcı', '0532 111 22 33', 'İstanbul', 'Teknoloji meraklısı, güvenilir satıcı.'),
('kullanici-ahmet', 'ahmet@teknoel.com', '$2a$10$htKooOU4Ij81zHomd1QBdukx6cKK0vwE0SvI1I.rtr/u4xKTSn.nS', 'Ahmet Yılmaz', '0533 222 33 44', 'Ankara', 'Bilgisayar mühendisi, ikinci el teknoloji satıcısı.'),
('kullanici-mehmet', 'mehmet@teknoel.com', '$2a$10$Rt2FLWjoZid3FJsqzSwTuuqN1L41.ZG9eq.3ZMbrJolPTjTGsgEC2', 'Mehmet Kaya', '0535 333 44 55', 'İzmir', 'Oyun dünyasının satıcısı, konsol uzmanı.')
;

-- -----------------------------------------------------
-- Seed data for table `ilanlar`
-- -----------------------------------------------------
INSERT INTO `ilanlar` (`id`, `baslik`, `aciklama`, `fiyat`, `kategori`, `altKategori`, `resimler`, `durum`, `sehir`, `ilce`, `vitrin`, `anasayfaPin`, `renkliYazi`, `kalinYazi`, `dopingBitis`, `kullaniciId`, `goruntuleme`) VALUES
('ilan-1', 'ASUS ROG Strix RTX 4090 OC 24GB - Garantili', 'Asus ROG Strix RTX 4090 OC 24GB GDDR6X. Faturalı, garantili, kutusu tam. 8 ay kullanıldı. Performans düşüşü yok, temizlendi. Kargo ile gönderilebilir. Elden teslim İstanbul Kadıköy.', 38500, 'Bilgisayar Parçaları', 'Ekran Kartı (GPU)', '["https://picsum.photos/seed/rtx4090/800/600","https://picsum.photos/seed/rtx4090b/800/600"]', 'AKTIF', 'İstanbul', 'Kadıköy', 1, 1, 1, 1, '2026-04-22 18:03:24', 'kullanici-demo', 1247),
('ilan-2', 'iPhone 15 Pro Max 256GB Doğal Titanyum - Sıfır Ayarında', 'iPhone 15 Pro Max 256GB, Doğal Titanyum renk. Kutusunda faturası mevcut. Hiçbir çizik yok, kılıf ile kullanıldı. Apple Türkiye garantisi devam ediyor. Değişim düşünmüyorum.', 44900, 'Cep Telefonu', 'Akıllı Telefon', '["https://picsum.photos/seed/iphone15/800/600","https://picsum.photos/seed/iphone15b/800/600"]', 'AKTIF', 'İstanbul', 'Beşiktaş', 1, 0, 1, 1, '2026-04-22 18:03:24', 'kullanici-ahmet', 2891),
('ilan-3', 'MacBook Pro M3 Max 16" 36GB RAM 1TB - AppleCare+', 'MacBook Pro M3 Max işlemci, 36GB Birleşik Bellek, 1TB SSD. Space Black renk. AppleCare+ ile 2 yıl garantisi var. Grafik tasarım için kullanıldı, performans mükemmel. Kutusu ve aksesuarları tam.', 89000, 'Laptop & Notebook', 'İş Laptopu', '["https://picsum.photos/seed/macbookm3/800/600","https://picsum.photos/seed/macbookm3b/800/600"]', 'AKTIF', 'İzmir', 'Bornova', 1, 1, 1, 1, '2026-04-22 18:03:24', 'kullanici-mehmet', 3456),
('ilan-4', 'PlayStation 5 Slim + 2 DualSense + FIFA 25 + God of War', 'PS5 Slim Disc Edition, 1TB. Kutusunda garantisi devam ediyor. 2 adet DualSense kol (biri hiç kullanılmadı), FIFA 25 ve God of War Ragnarök oyunları dahil. Çok temiz durumda.', 19500, 'Oyun Konsolu', 'PlayStation', '["https://picsum.photos/seed/ps5slim/800/600","https://picsum.photos/seed/ps5slimb/800/600"]', 'AKTIF', 'Ankara', 'Çankaya', 1, 0, 1, 1, '2026-04-22 18:03:24', 'kullanici-ahmet', 1876),
('ilan-5', 'AMD Ryzen 9 7950X - Kutusunda Faturalı', 'AMD Ryzen 9 7950X işlemci, 16 çekirdek 32 thread. Kutusunda, faturası mevcut, garantisi devam ediyor. Hiç kullanılmadı, açılmadı bile. Acil satışa çıkardım.', 13500, 'Bilgisayar Parçaları', 'İşlemci (CPU)', '["https://picsum.photos/seed/ryzen9/800/600"]', 'AKTIF', 'İstanbul', 'Ümraniye', 1, 0, 1, 1, '2026-04-22 18:03:24', 'kullanici-demo', 934),
('ilan-6', 'Samsung Galaxy S24 Ultra 512GB Titanyum Siyah', 'Samsung Galaxy S24 Ultra, 512GB dahili hafıza, 12GB RAM. Titanyum Siyah renk. Samsung Türkiye garantisi var, faturalı. S-Pen dahil. Telefonu değiştirdiğim için satıyorum.', 39900, 'Cep Telefonu', 'Akıllı Telefon', '["https://picsum.photos/seed/s24ultra/800/600","https://picsum.photos/seed/s24ultrab/800/600"]', 'AKTIF', 'İzmir', 'Karşıyaka', 1, 0, 1, 1, '2026-04-22 18:03:24', 'kullanici-mehmet', 2103),
('ilan-7', 'ASUS ROG Swift PG32UQX 4K 144Hz 32" IPS Gaming Monitör', 'ASUS ROG Swift PG32UQX, 4K UHD 3840x2160, 144Hz, IPS panel, G-Sync Ultimate. 14 ay önce alındı, kutusu ve aksesuarları mevcut. Gaming kurulumunu dağıttığım için satıyorum.', 24000, 'Monitör', 'Gaming Monitör', '["https://picsum.photos/seed/rogmonitor/800/600"]', 'AKTIF', 'Ankara', 'Keçiören', 0, 0, 1, 1, '2026-04-22 18:03:24', 'kullanici-ahmet', 567),
('ilan-8', 'Nintendo Switch OLED + 15 Oyun + Taşıma Çantası', 'Nintendo Switch OLED Model, beyaz renk. 15 adet dijital oyun yüklü (Mario, Zelda, Pokemon dahil). Özel taşıma çantası ve ekstra kılıf mevcut. 1 yıl kullanıldı, ekranda sıfır çizik.', 10500, 'Oyun Konsolu', 'Nintendo Switch', '["https://picsum.photos/seed/switcholed/800/600"]', 'AKTIF', 'Bursa', 'Osmangazi', 0, 0, 1, 1, '2026-04-22 18:03:24', 'kullanici-demo', 789),
('ilan-9', 'Corsair Vengeance 64GB DDR5 6000MHz RGB RAM', 'Corsair Vengeance DDR5, 2x32GB kit, 6000MHz CL36. RGB aydınlatma. Intel XMP 3.0 destekli. Yaklaşık 6 ay kullanıldı, hiçbir sorun yok. Sistem değişikliği nedeniyle satışa çıkarıldı.', 4800, 'Bilgisayar Parçaları', 'RAM', '["https://picsum.photos/seed/corsairram/800/600"]', 'AKTIF', 'İstanbul', 'Maltepe', 0, 0, 0, 0, NULL, 'kullanici-demo', 234),
('ilan-10', 'iPad Pro M4 11" 256GB WiFi + Cellular Uzay Siyahı', 'iPad Pro M4 11 inç, 256GB, WiFi+Cellular. Uzay Siyahı renk. Apple Pencil Pro ile birlikte (ayrıca satılır). 3 ay kullanıldı, kaportası sıfır. Okul için alınmıştı, kullanmıyorum.', 34500, 'Tablet', 'iPad', '["https://picsum.photos/seed/ipadprom4/800/600","https://picsum.photos/seed/ipadprom4b/800/600"]', 'AKTIF', 'İzmir', 'Konak', 0, 0, 0, 0, NULL, 'kullanici-mehmet', 456),
('ilan-11', 'Logitech G Pro X Superlight 2 Gaming Mouse', 'Logitech G Pro X Superlight 2, siyah renk. HERO 2 sensor, 32000 DPI. Yeni fiyatın çok altında. 2 ay kullanıldı, kutusu var. Oyun bırakma nedeniyle satıyorum.', 2200, 'Aksesuar', 'Klavye & Mouse', '["https://picsum.photos/seed/logitechg/800/600"]', 'AKTIF', 'Ankara', 'Yenimahalle', 0, 0, 0, 0, NULL, 'kullanici-ahmet', 189),
('ilan-12', 'MSI MAG B650 TOMAHAWK WIFI Anakart AM5', 'MSI MAG B650 TOMAHAWK WIFI anakart, AM5 soket. DDR5 destekli, PCIe 5.0 M.2. WiFi 6E dahili. 4 ay kullanıldı, sorunsuz çalışıyor. Kutusu ve aksesuarları mevcut.', 5200, 'Bilgisayar Parçaları', 'Anakart', '["https://picsum.photos/seed/msianakart/800/600"]', 'AKTIF', 'İstanbul', 'Bağcılar', 0, 0, 0, 0, NULL, 'kullanici-demo', 312),
('ilan-13', 'Sony WH-1000XM5 Kablosuz Gürültü Önleyici Kulaklık', 'Sony WH-1000XM5, siyah renk. Sektörün en iyi ANC teknolojisi. 30 saat pil ömrü. 5 ay kullanıldı, orijinal kılıfı ve aksesuarları mevcut. Temiz, bakımlı.', 6800, 'Aksesuar', 'Kulaklık', '["https://picsum.photos/seed/sonywh/800/600"]', 'AKTIF', 'İzmir', 'Bayraklı', 0, 0, 0, 0, NULL, 'kullanici-mehmet', 267),
('ilan-14', 'Xbox Series X 1TB + Game Pass Ultimate 6 Aylık', 'Xbox Series X, 1TB SSD. 6 aylık Game Pass Ultimate kodu dahil. Orijinal kutusunda, garantisi var. 8 ay kullanıldı, hiçbir sorun yaşamadım. PS5\'e geçiş nedeniyle satıyorum.', 15000, 'Oyun Konsolu', 'Xbox', '["https://picsum.photos/seed/xboxsx/800/600"]', 'AKTIF', 'Bursa', 'Nilüfer', 0, 0, 0, 0, NULL, 'kullanici-ahmet', 543),
('ilan-15', 'Lenovo ThinkPad X1 Carbon Gen 12 i7-1365U 32GB 1TB', 'Lenovo ThinkPad X1 Carbon 12. Nesil, Intel Core Ultra 7 165U, 32GB LPDDR5, 1TB NVMe SSD. 14" 2.8K OLED ekran. İş seyahati için alındı, nadiren kullanıldı. Faturalı garantili.', 52000, 'Laptop & Notebook', 'İş Laptopu', '["https://picsum.photos/seed/thinkpadx1/800/600"]', 'AKTIF', 'Ankara', 'Çankaya', 0, 0, 0, 0, NULL, 'kullanici-ahmet', 678)
;

SET FOREIGN_KEY_CHECKS=1;