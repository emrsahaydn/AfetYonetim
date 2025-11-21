import { getPool } from '../config/database.js';

// Trabzon'un karada olan 5 provider konumu
// Trabzon koordinat aralığı: Enlem 40.5-41.2, Boylam 39.0-40.5 (karada olanlar)
const providers = [
  { name: 'Merkez Yardım Merkezi', location: 'Trabzon Merkez', lat: 41.0015, lon: 39.7178, water: 500, blanket: 300, food: 400 },
  { name: 'Ortahisar Yardım Noktası', location: 'Ortahisar', lat: 41.0050, lon: 39.7200, water: 450, blanket: 250, food: 350 },
  { name: 'Yomra Yardım Noktası', location: 'Yomra', lat: 40.9600, lon: 39.8600, water: 480, blanket: 280, food: 380 },
  { name: 'Akçaabat Yardım Merkezi', location: 'Akçaabat', lat: 41.0200, lon: 39.5800, water: 400, blanket: 200, food: 300 },
  { name: 'Çarşıbaşı Yardım Merkezi', location: 'Çarşıbaşı', lat: 41.0300, lon: 39.4200, water: 370, blanket: 200, food: 300 },
];

export const seedProviders = async () => {
  try {
    const pool = await getPool();
    
    // Önce mevcut provider'ları kontrol et
    const existingCheck = await pool.request().query("SELECT COUNT(*) as count FROM [dbo].[Resources] WHERE Type = 'Provider'");
    const existingCount = existingCheck.recordset[0].count;
    
    if (existingCount >= providers.length) {
      console.log('Provider verileri zaten mevcut.');
      return;
    }

    console.log('Provider verileri ekleniyor...');
    
    for (const provider of providers) {
      try {
        await pool.request()
          .input('name', provider.name)
          .input('type', 'Provider')
          .input('description', `${provider.location} bölgesinde yardım sağlayıcı`)
          .input('location', provider.location)
          .input('latitude', provider.lat)
          .input('longitude', provider.lon)
          .input('quantity', provider.water + provider.blanket + provider.food)
          .input('available', provider.water + provider.blanket + provider.food)
          .input('waterCount', provider.water)
          .input('blanketCount', provider.blanket)
          .input('foodCount', provider.food)
          .input('status', 'Aktif')
          .query(`
            INSERT INTO [dbo].[Resources] 
            (Name, Type, Description, Location, Latitude, Longitude, Quantity, Available, WaterCount, BlanketCount, FoodCount, Status)
            VALUES (@name, @type, @description, @location, @latitude, @longitude, @quantity, @available, @waterCount, @blanketCount, @foodCount, @status)
          `);
      } catch (error) {
        // Zaten varsa devam et
        if (!error.message.includes('duplicate') && !error.message.includes('UNIQUE')) {
          console.warn(`${provider.name} eklenirken hata:`, error.message);
        }
      }
    }
    
    console.log(`${providers.length} provider verisi eklendi.`);
  } catch (error) {
    console.error('Provider verileri eklenirken hata:', error);
    throw error;
  }
};

