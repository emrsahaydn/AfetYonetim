import { getPool } from '../config/database.js';

// Türkiye'nin büyük şehirlerinde provider konumları
// Türkiye koordinat aralığı: Enlem 36-42, Boylam 26-45
const turkeyCities = [
  { name: 'İstanbul Merkez Yardım Merkezi', location: 'İstanbul', lat: 41.0082, lon: 28.9784, water: 1000, blanket: 600, food: 800 },
  { name: 'Ankara Merkez Yardım Merkezi', location: 'Ankara', lat: 39.9334, lon: 32.8597, water: 900, blanket: 550, food: 750 },
  { name: 'İzmir Yardım Merkezi', location: 'İzmir', lat: 38.4192, lon: 27.1287, water: 850, blanket: 500, food: 700 },
  { name: 'Bursa Yardım Merkezi', location: 'Bursa', lat: 40.1826, lon: 29.0665, water: 800, blanket: 480, food: 650 },
  { name: 'Antalya Yardım Merkezi', location: 'Antalya', lat: 36.8969, lon: 30.7133, water: 750, blanket: 450, food: 600 },
  { name: 'Adana Yardım Merkezi', location: 'Adana', lat: 36.9914, lon: 35.3308, water: 700, blanket: 420, food: 580 },
  { name: 'Konya Yardım Merkezi', location: 'Konya', lat: 37.8746, lon: 32.4932, water: 680, blanket: 400, food: 550 },
  { name: 'Gaziantep Yardım Merkezi', location: 'Gaziantep', lat: 37.0662, lon: 37.3833, water: 650, blanket: 380, food: 520 },
  { name: 'Şanlıurfa Yardım Merkezi', location: 'Şanlıurfa', lat: 37.1674, lon: 38.7955, water: 620, blanket: 360, food: 500 },
  { name: 'Kocaeli Yardım Merkezi', location: 'Kocaeli', lat: 40.8533, lon: 29.8815, water: 600, blanket: 350, food: 480 },
  { name: 'Mersin Yardım Merkezi', location: 'Mersin', lat: 36.8000, lon: 34.6333, water: 580, blanket: 340, food: 460 },
  { name: 'Diyarbakır Yardım Merkezi', location: 'Diyarbakır', lat: 37.9100, lon: 40.2300, water: 560, blanket: 330, food: 440 },
  { name: 'Hatay Yardım Merkezi', location: 'Hatay', lat: 36.4018, lon: 36.3498, water: 540, blanket: 320, food: 420 },
  { name: 'Manisa Yardım Merkezi', location: 'Manisa', lat: 38.6140, lon: 27.4296, water: 520, blanket: 310, food: 400 },
  { name: 'Kayseri Yardım Merkezi', location: 'Kayseri', lat: 38.7312, lon: 35.4787, water: 500, blanket: 300, food: 380 },
  { name: 'Samsun Yardım Merkezi', location: 'Samsun', lat: 41.2867, lon: 36.3300, water: 480, blanket: 290, food: 360 },
  { name: 'Kahramanmaraş Yardım Merkezi', location: 'Kahramanmaraş', lat: 37.5858, lon: 36.9371, water: 460, blanket: 280, food: 340 },
  { name: 'Van Yardım Merkezi', location: 'Van', lat: 38.4891, lon: 43.4089, water: 440, blanket: 270, food: 320 },
  { name: 'Denizli Yardım Merkezi', location: 'Denizli', lat: 37.7765, lon: 29.0864, water: 420, blanket: 260, food: 300 },
  { name: 'Trabzon Yardım Merkezi', location: 'Trabzon', lat: 41.0015, lon: 39.7178, water: 400, blanket: 250, food: 280 },
];

// Aktif yardım taleplerine göre provider'ları dinamik olarak oluştur
// Türkiye'nin 4'te 1'i kadar aktif talebe göre provider oluştur
export const seedProvidersTurkey = async () => {
  try {
    const pool = await getPool();
    
    // Aktif yardım taleplerini say
    const activeRequestsResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM [dbo].[HelpRequests] 
      WHERE Status IN ('Kritik', 'Yardım Gönderiliyor')
    `);
    const activeRequestCount = activeRequestsResult.recordset[0].count;
    
    // Türkiye'nin 4'te 1'i kadar provider oluştur (minimum 5, maximum 20)
    const providerCount = Math.max(5, Math.min(20, Math.ceil(activeRequestCount / 4)));
    
    console.log(`Aktif yardim talebi sayisi: ${activeRequestCount}, Provider sayisi: ${providerCount}`);
    
    // Mevcut provider'ları sil
    await pool.request().query("DELETE FROM [dbo].[Resources] WHERE Type = 'Provider'");
    console.log('Mevcut providerlar silindi.');
    
    // Belirlenen sayıda provider ekle (rastgele şehirlerden)
    const selectedCities = [];
    const usedIndices = new Set();
    
    while (selectedCities.length < providerCount && selectedCities.length < turkeyCities.length) {
      const randomIndex = Math.floor(Math.random() * turkeyCities.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedCities.push(turkeyCities[randomIndex]);
      }
    }
    
    // Seçilen şehirlerden provider'ları ekle
    for (const city of selectedCities) {
      await pool.request()
        .input('name', city.name)
        .input('type', 'Provider')
        .input('description', `${city.location} bölgesinde yardım sağlayıcı`)
        .input('location', city.location)
        .input('latitude', city.lat)
        .input('longitude', city.lon)
        .input('quantity', city.water + city.blanket + city.food)
        .input('available', city.water + city.blanket + city.food)
        .input('waterCount', city.water)
        .input('blanketCount', city.blanket)
        .input('foodCount', city.food)
        .input('status', 'Aktif')
        .query(`
          INSERT INTO [dbo].[Resources] 
          (Name, Type, Description, Location, Latitude, Longitude, Quantity, Available, WaterCount, BlanketCount, FoodCount, Status)
          VALUES (@name, @type, @description, @location, @latitude, @longitude, @quantity, @available, @waterCount, @blanketCount, @foodCount, @status)
        `);
    }
    
    console.log(`${selectedCities.length} provider verisi eklendi (Turkiye genelinde).`);
  } catch (error) {
    console.error('Provider ekleme hatasi:', error);
    throw error;
  }
};

