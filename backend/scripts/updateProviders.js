import { getPool } from '../config/database.js';

// Provider'ları güncelle: 30'dan 5'e düşür ve denizde olanları sil
export const updateProviders = async () => {
  try {
    const pool = await getPool();
    
    console.log('Providerlar guncelleniyor...');
    
    // 1. Tüm provider'ları sil
    await pool.request().query("DELETE FROM [dbo].[Resources] WHERE Type = 'Provider'");
    console.log('Tum providerlar silindi.');
    
    // 2. Karada olan 5 provider'ı ekle
    const providers = [
      { name: 'Merkez Yardım Merkezi', location: 'Trabzon Merkez', lat: 41.0015, lon: 39.7178, water: 500, blanket: 300, food: 400 },
      { name: 'Ortahisar Yardım Noktası', location: 'Ortahisar', lat: 41.0050, lon: 39.7200, water: 450, blanket: 250, food: 350 },
      { name: 'Yomra Yardım Noktası', location: 'Yomra', lat: 40.9600, lon: 39.8600, water: 480, blanket: 280, food: 380 },
      { name: 'Akçaabat Yardım Merkezi', location: 'Akçaabat', lat: 41.0200, lon: 39.5800, water: 400, blanket: 200, food: 300 },
      { name: 'Çarşıbaşı Yardım Merkezi', location: 'Çarşıbaşı', lat: 41.0300, lon: 39.4200, water: 370, blanket: 200, food: 300 },
    ];
    
    for (const provider of providers) {
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
    }
    
    console.log(`${providers.length} provider verisi eklendi (karada olanlar).`);
  } catch (error) {
    console.error('Provider güncelleme hatası:', error);
    throw error;
  }
};

