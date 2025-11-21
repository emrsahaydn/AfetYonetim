# Afet Yönetimi Sistemi

Bu proje, afet durumlarında yardım talepleri ve kaynak yönetimi için geliştirilmiş bir web uygulamasıdır.

## Teknolojiler

- **Frontend**: React + Redux + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Veritabanı**: Microsoft SQL Server (MSSQL)
- **Containerization**: Docker & Docker Compose

## Hızlı Başlangıç (Docker ile)

### Gereksinimler

- Docker Desktop (Mac/Windows) veya Docker Engine (Linux)
- Docker Compose

### Kurulum ve Çalıştırma

1. **Projeyi klonlayın veya indirin**

2. **Docker Compose ile tüm servisleri başlatın:**
```bash
docker-compose up -d
```

Bu komut şunları yapacak:
- MSSQL Server container'ını başlatacak
- Backend API container'ını başlatacak
- Veritabanını otomatik oluşturacak
- Tabloları otomatik oluşturacak

3. **Logları kontrol edin:**
```bash
docker-compose logs -f
```

4. **Frontend'i başlatın (ayrı terminal):**
```bash
cd frontend
npm install
npm run dev
```

### Servis Adresleri

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5173 (Vite default port)
- **MSSQL Server**: localhost:1433

### API Endpoints

- `GET /api/health` - Sağlık kontrolü
- `GET /api/help-requests` - Yardım taleplerini listele
- `GET /api/help-requests/:id` - Tek bir yardım talebini getir
- `POST /api/help-requests` - Yeni yardım talebi oluştur
- `PUT /api/help-requests/:id` - Yardım talebini güncelle
- `DELETE /api/help-requests/:id` - Yardım talebini sil
- `GET /api/resources` - Kaynakları listele
- `GET /api/resources/:id` - Tek bir kaynağı getir
- `POST /api/resources` - Yeni kaynak oluştur
- `PUT /api/resources/:id` - Kaynağı güncelle
- `DELETE /api/resources/:id` - Kaynağı sil
- `GET /api/users` - Kullanıcıları listele
- `POST /api/users` - Yeni kullanıcı oluştur
- `GET /api/alerts` - Uyarıları listele
- `POST /api/alerts` - Yeni uyarı oluştur
- `GET /api/assignments` - Atamaları listele
- `POST /api/assignments` - Yeni atama oluştur
- `GET /api/messages` - Mesajları listele
- `POST /api/messages` - Yeni mesaj oluştur

## Docker Komutları

### Servisleri durdurma
```bash
docker-compose down
```

### Servisleri durdurma ve volume'ları silme
```bash
docker-compose down -v
```

### Servisleri yeniden başlatma
```bash
docker-compose restart
```

### Sadece backend'i yeniden build etme
```bash
docker-compose build backend
docker-compose up -d backend
```

### Veritabanı loglarını görüntüleme
```bash
docker-compose logs mssql
```

### Backend loglarını görüntüleme
```bash
docker-compose logs backend
```

## Manuel Kurulum (Docker olmadan)

### Backend

```bash
cd backend
npm install
npm start
```

veya development modu için:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### MSSQL

MSSQL Server'ı manuel olarak kurmanız ve çalıştırmanız gerekir. Ardından `.env` dosyası oluşturup veritabanı bilgilerini girin.

## Veritabanı Bilgileri (Docker)

- **Server**: mssql (Docker network içinde) veya localhost:1433 (dışarıdan)
- **Database**: CareLinkDB
- **Username**: sa
- **Password**: CareLink123!

**Not**: Production ortamında şifreyi mutlaka değiştirin!

### Veritabanı Tabloları

- `[dbo].[Users]` - Kullanıcılar
- `[dbo].[UserStatuses]` - Kullanıcı durumları
- `[dbo].[HelpRequests]` - Yardım talepleri
- `[dbo].[Resources]` - Kaynaklar
- `[dbo].[Assignments]` - Atamalar
- `[dbo].[Messages]` - Mesajlar
- `[dbo].[Alerts]` - Uyarılar

## Sorun Giderme

### Backend veritabanına bağlanamıyor

1. MSSQL container'ının çalıştığından emin olun:
```bash
docker-compose ps
```

2. MSSQL loglarını kontrol edin:
```bash
docker-compose logs mssql
```

3. Backend loglarını kontrol edin:
```bash
docker-compose logs backend
```

### Port zaten kullanılıyor hatası

Eğer 1433 veya 5000 portları kullanılıyorsa, `docker-compose.yml` dosyasındaki port numaralarını değiştirebilirsiniz.

### Veritabanı tabloları oluşmadı

Backend ilk başlatıldığında otomatik olarak veritabanını ve tabloları oluşturur. Eğer oluşmadıysa:

```bash
docker-compose restart backend
```

Backend loglarını kontrol ederek veritabanı başlatma işleminin başarılı olup olmadığını görebilirsiniz.

## Geliştirme

### Backend kodunu değiştirdikten sonra

Backend volume mount edildiği için kod değişiklikleri otomatik olarak yansır. Ancak Node.js uygulamaları için container'ı yeniden başlatmanız gerekebilir:

```bash
docker-compose restart backend
```

Veya nodemon kullanarak development modunda çalıştırabilirsiniz (package.json'da `dev` script'i mevcut).

### Veritabanını sıfırlama

```bash
docker-compose down -v
docker-compose up -d
```

Bu komut tüm volume'ları siler ve veritabanını sıfırdan oluşturur.

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
