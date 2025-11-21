import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Haversine formülü ile mesafe hesaplama
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Tüm kaynakları getir (sadece aktif yardım taleplerinin olduğu şehirlerdeki provider'lar)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Aktif yardım taleplerini getir
    const activeRequestsResult = await pool.request().query(`
      SELECT DISTINCT Location, Latitude, Longitude
      FROM [dbo].[HelpRequests]
      WHERE Status IN ('Kritik', 'Yardım Gönderiliyor')
    `);
    
    // Tüm provider'ları getir
    const allProvidersResult = await pool.request().query(`
      SELECT * FROM [dbo].[Resources] 
      WHERE Type = 'Provider'
      ORDER BY CreatedAt DESC
    `);
    
    // Aktif talep olan şehirlerdeki provider'ları filtrele (sadece aynı şehir)
    const relevantProviders = [];
    const usedProviderIds = new Set();
    
    for (const request of activeRequestsResult.recordset) {
      for (const provider of allProvidersResult.recordset) {
        if (usedProviderIds.has(provider.Id)) continue;
        
        // Sadece aynı şehirdeki provider'ları ekle
        if (request.Location === provider.Location) {
          relevantProviders.push(provider);
          usedProviderIds.add(provider.Id);
        }
      }
    }
    
    // Aktif talep yoksa boş dizi döndür
    if (activeRequestsResult.recordset.length === 0) {
      return res.json([]);
    }
    
    res.json(relevantProviders);
  } catch (error) {
    console.error('Resources getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tek bir kaynağı getir
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('SELECT * FROM [dbo].[Resources] WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Kaynak bulunamadı' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Resource getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni kaynak oluştur
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      location,
      latitude,
      longitude,
      quantity,
      available,
      waterCount,
      blanketCount,
      foodCount,
      status,
    } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('name', name)
      .input('type', type)
      .input('description', description || '')
      .input('location', location)
      .input('latitude', latitude)
      .input('longitude', longitude)
      .input('quantity', quantity || 0)
      .input('available', available || 0)
      .input('waterCount', waterCount || 0)
      .input('blanketCount', blanketCount || 0)
      .input('foodCount', foodCount || 0)
      .input('status', status || 'Aktif')
      .query(`
        INSERT INTO [dbo].[Resources] 
        (Name, Type, Description, Location, Latitude, Longitude, Quantity, Available, WaterCount, BlanketCount, FoodCount, Status)
        OUTPUT INSERTED.*
        VALUES (@name, @type, @description, @location, @latitude, @longitude, @quantity, @available, @waterCount, @blanketCount, @foodCount, @status)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Resource oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kaynağı güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      description,
      location,
      latitude,
      longitude,
      quantity,
      available,
      waterCount,
      blanketCount,
      foodCount,
      status,
    } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('id', id)
      .input('name', name)
      .input('type', type)
      .input('description', description)
      .input('location', location)
      .input('latitude', latitude)
      .input('longitude', longitude)
      .input('quantity', quantity)
      .input('available', available)
      .input('waterCount', waterCount)
      .input('blanketCount', blanketCount)
      .input('foodCount', foodCount)
      .input('status', status)
      .query(`
        UPDATE [dbo].[Resources]
        SET Name = @name,
            Type = @type,
            Description = @description,
            Location = @location,
            Latitude = @latitude,
            Longitude = @longitude,
            Quantity = @quantity,
            Available = @available,
            WaterCount = @waterCount,
            BlanketCount = @blanketCount,
            FoodCount = @foodCount,
            Status = @status,
            UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Kaynak bulunamadı' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Resource güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kaynağı sil
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM [dbo].[Resources] WHERE Id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Kaynak bulunamadı' });
    }

    res.json({ message: 'Kaynak başarıyla silindi' });
  } catch (error) {
    console.error('Resource silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
