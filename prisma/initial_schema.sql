-- Prisma schema based MySQL DDL
-- Generated from prisma/schema.prisma

CREATE TABLE `Users` (
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
  CONSTRAINT `ilanlar_kullaniciId_fkey` FOREIGN KEY (`kullaniciId`) REFERENCES `Users` (`id`) ON DELETE CASCADE
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
  CONSTRAINT `odemeler_kullaniciId_fkey` FOREIGN KEY (`kullaniciId`) REFERENCES `Users` (`id`),
  CONSTRAINT `odemeler_paketId_fkey` FOREIGN KEY (`paketId`) REFERENCES `doping_paketler` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
