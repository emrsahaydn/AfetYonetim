import { getPool } from '../config/database.js';

// Türkiye'nin 81 ili ve koordinatları
const turkey81Cities = [
  { name: 'İstanbul Yardım Merkezi', location: 'İstanbul', lat: 41.0082, lon: 28.9784, water: 1000, blanket: 600, food: 800 },
  { name: 'Ankara Yardım Merkezi', location: 'Ankara', lat: 39.9334, lon: 32.8597, water: 900, blanket: 550, food: 750 },
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
  { name: 'Sivas Yardım Merkezi', location: 'Sivas', lat: 39.7477, lon: 37.0179, water: 380, blanket: 240, food: 260 },
  { name: 'Malatya Yardım Merkezi', location: 'Malatya', lat: 38.3552, lon: 38.3095, water: 360, blanket: 230, food: 240 },
  { name: 'Erzurum Yardım Merkezi', location: 'Erzurum', lat: 39.9043, lon: 41.2679, water: 340, blanket: 220, food: 220 },
  { name: 'Erzincan Yardım Merkezi', location: 'Erzincan', lat: 39.7500, lon: 39.5000, water: 320, blanket: 210, food: 200 },
  { name: 'Batman Yardım Merkezi', location: 'Batman', lat: 37.8814, lon: 41.1351, water: 300, blanket: 200, food: 180 },
  { name: 'Elazığ Yardım Merkezi', location: 'Elazığ', lat: 38.6753, lon: 39.2206, water: 280, blanket: 190, food: 160 },
  { name: 'Iğdır Yardım Merkezi', location: 'Iğdır', lat: 39.9167, lon: 44.0333, water: 260, blanket: 180, food: 140 },
  { name: 'Giresun Yardım Merkezi', location: 'Giresun', lat: 40.9128, lon: 38.3895, water: 240, blanket: 170, food: 120 },
  { name: 'Ordu Yardım Merkezi', location: 'Ordu', lat: 40.9839, lon: 37.8764, water: 220, blanket: 160, food: 100 },
  { name: 'Rize Yardım Merkezi', location: 'Rize', lat: 41.0201, lon: 40.5234, water: 200, blanket: 150, food: 90 },
  { name: 'Artvin Yardım Merkezi', location: 'Artvin', lat: 41.1828, lon: 41.8183, water: 180, blanket: 140, food: 80 },
  { name: 'Aydın Yardım Merkezi', location: 'Aydın', lat: 37.8444, lon: 27.8458, water: 160, blanket: 130, food: 70 },
  { name: 'Muğla Yardım Merkezi', location: 'Muğla', lat: 37.2153, lon: 28.3636, water: 140, blanket: 120, food: 60 },
  { name: 'Balıkesir Yardım Merkezi', location: 'Balıkesir', lat: 39.6484, lon: 27.8826, water: 120, blanket: 110, food: 50 },
  { name: 'Tekirdağ Yardım Merkezi', location: 'Tekirdağ', lat: 40.9833, lon: 27.5167, water: 100, blanket: 100, food: 40 },
  { name: 'Eskişehir Yardım Merkezi', location: 'Eskişehir', lat: 39.7767, lon: 30.5206, water: 90, blanket: 90, food: 35 },
  { name: 'Sakarya Yardım Merkezi', location: 'Sakarya', lat: 40.7569, lon: 30.3781, water: 80, blanket: 80, food: 30 },
  { name: 'Afyonkarahisar Yardım Merkezi', location: 'Afyonkarahisar', lat: 38.7569, lon: 30.5387, water: 70, blanket: 70, food: 25 },
  { name: 'Isparta Yardım Merkezi', location: 'Isparta', lat: 37.7648, lon: 30.5566, water: 60, blanket: 60, food: 20 },
  { name: 'Burdur Yardım Merkezi', location: 'Burdur', lat: 37.7206, lon: 30.2906, water: 50, blanket: 50, food: 15 },
  { name: 'Niğde Yardım Merkezi', location: 'Niğde', lat: 37.9667, lon: 34.6833, water: 40, blanket: 40, food: 10 },
  { name: 'Nevşehir Yardım Merkezi', location: 'Nevşehir', lat: 38.6244, lon: 34.7239, water: 30, blanket: 30, food: 5 },
  { name: 'Kırşehir Yardım Merkezi', location: 'Kırşehir', lat: 39.1458, lon: 34.1606, water: 25, blanket: 25, food: 3 },
  { name: 'Amasya Yardım Merkezi', location: 'Amasya', lat: 40.6539, lon: 35.8331, water: 20, blanket: 20, food: 2 },
  { name: 'Tokat Yardım Merkezi', location: 'Tokat', lat: 40.3239, lon: 36.5522, water: 15, blanket: 15, food: 1 },
  { name: 'Çorum Yardım Merkezi', location: 'Çorum', lat: 40.5489, lon: 34.9533, water: 10, blanket: 10, food: 1 },
  { name: 'Kastamonu Yardım Merkezi', location: 'Kastamonu', lat: 41.3767, lon: 33.7767, water: 8, blanket: 8, food: 1 },
  { name: 'Sinop Yardım Merkezi', location: 'Sinop', lat: 42.0267, lon: 35.1556, water: 7, blanket: 7, food: 1 },
  { name: 'Çanakkale Yardım Merkezi', location: 'Çanakkale', lat: 40.1553, lon: 26.4142, water: 6, blanket: 6, food: 1 },
  { name: 'Edirne Yardım Merkezi', location: 'Edirne', lat: 41.6769, lon: 26.5556, water: 5, blanket: 5, food: 1 },
  { name: 'Kırklareli Yardım Merkezi', location: 'Kırklareli', lat: 41.7342, lon: 27.2253, water: 4, blanket: 4, food: 1 },
  { name: 'Bilecik Yardım Merkezi', location: 'Bilecik', lat: 40.1419, lon: 29.9794, water: 3, blanket: 3, food: 1 },
  { name: 'Bolu Yardım Merkezi', location: 'Bolu', lat: 40.7319, lon: 31.6061, water: 2, blanket: 2, food: 1 },
  { name: 'Düzce Yardım Merkezi', location: 'Düzce', lat: 40.8439, lon: 31.1564, water: 1, blanket: 1, food: 1 },
  { name: 'Zonguldak Yardım Merkezi', location: 'Zonguldak', lat: 41.4564, lon: 31.7986, water: 1, blanket: 1, food: 1 },
  { name: 'Bartın Yardım Merkezi', location: 'Bartın', lat: 41.6361, lon: 32.3375, water: 1, blanket: 1, food: 1 },
  { name: 'Karabük Yardım Merkezi', location: 'Karabük', lat: 41.1967, lon: 32.6258, water: 1, blanket: 1, food: 1 },
  { name: 'Aksaray Yardım Merkezi', location: 'Aksaray', lat: 38.3686, lon: 34.0278, water: 1, blanket: 1, food: 1 },
  { name: 'Karaman Yardım Merkezi', location: 'Karaman', lat: 37.1811, lon: 33.2150, water: 1, blanket: 1, food: 1 },
  { name: 'Mardin Yardım Merkezi', location: 'Mardin', lat: 37.3122, lon: 40.7350, water: 1, blanket: 1, food: 1 },
  { name: 'Şırnak Yardım Merkezi', location: 'Şırnak', lat: 37.5167, lon: 42.4500, water: 1, blanket: 1, food: 1 },
  { name: 'Siirt Yardım Merkezi', location: 'Siirt', lat: 37.9253, lon: 41.9458, water: 1, blanket: 1, food: 1 },
  { name: 'Bitlis Yardım Merkezi', location: 'Bitlis', lat: 38.4008, lon: 42.1097, water: 1, blanket: 1, food: 1 },
  { name: 'Muş Yardım Merkezi', location: 'Muş', lat: 38.7342, lon: 41.4911, water: 1, blanket: 1, food: 1 },
  { name: 'Bingöl Yardım Merkezi', location: 'Bingöl', lat: 38.8847, lon: 40.4981, water: 1, blanket: 1, food: 1 },
  { name: 'Tunceli Yardım Merkezi', location: 'Tunceli', lat: 39.1081, lon: 39.5469, water: 1, blanket: 1, food: 1 },
  { name: 'Adıyaman Yardım Merkezi', location: 'Adıyaman', lat: 37.7642, lon: 38.2786, water: 1, blanket: 1, food: 1 },
  { name: 'Kilis Yardım Merkezi', location: 'Kilis', lat: 36.7181, lon: 37.1156, water: 1, blanket: 1, food: 1 },
  { name: 'Osmaniye Yardım Merkezi', location: 'Osmaniye', lat: 37.0681, lon: 36.2475, water: 1, blanket: 1, food: 1 },
  { name: 'Uşak Yardım Merkezi', location: 'Uşak', lat: 38.6828, lon: 29.4081, water: 1, blanket: 1, food: 1 },
  { name: 'Kütahya Yardım Merkezi', location: 'Kütahya', lat: 39.4167, lon: 29.9833, water: 1, blanket: 1, food: 1 },
  { name: 'Burdur Yardım Merkezi', location: 'Burdur', lat: 37.7206, lon: 30.2906, water: 1, blanket: 1, food: 1 },
  { name: 'Yozgat Yardım Merkezi', location: 'Yozgat', lat: 39.8208, lon: 34.8083, water: 1, blanket: 1, food: 1 },
  { name: 'Kırıkkale Yardım Merkezi', location: 'Kırıkkale', lat: 39.8450, lon: 33.5064, water: 1, blanket: 1, food: 1 },
  { name: 'Ağrı Yardım Merkezi', location: 'Ağrı', lat: 39.7192, lon: 43.0514, water: 1, blanket: 1, food: 1 },
  { name: 'Ardahan Yardım Merkezi', location: 'Ardahan', lat: 41.1081, lon: 42.7022, water: 1, blanket: 1, food: 1 },
  { name: 'Kars Yardım Merkezi', location: 'Kars', lat: 40.6028, lon: 43.0925, water: 1, blanket: 1, food: 1 },
  { name: 'Bayburt Yardım Merkezi', location: 'Bayburt', lat: 40.2561, lon: 40.2236, water: 1, blanket: 1, food: 1 },
  { name: 'Gümüşhane Yardım Merkezi', location: 'Gümüşhane', lat: 40.4603, lon: 39.5081, water: 1, blanket: 1, food: 1 },
];

// 81 ilde provider oluştur
export const seedProviders81Cities = async () => {
  try {
    const pool = await getPool();
    
    console.log('81 ilde provider olusturuluyor...');
    
    // Mevcut provider'ları sil
    await pool.request().query("DELETE FROM [dbo].[Resources] WHERE Type = 'Provider'");
    console.log('Mevcut providerlar silindi.');
    
    // 81 ilde provider ekle
    for (const city of turkey81Cities) {
      try {
        await pool.request()
          .input('name', city.name)
          .input('type', 'Provider')
          .input('description', `${city.location} ilinde yardım sağlayıcı`)
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
      } catch (error) {
        console.warn(`${city.location} provider eklenirken hata:`, error.message);
      }
    }
    
    console.log('81 ilde provider olusturuldu.');
  } catch (error) {
    console.error('Provider olusturma hatasi:', error);
    throw error;
  }
};

