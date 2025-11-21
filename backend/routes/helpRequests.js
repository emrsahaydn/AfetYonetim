import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Tüm yardım taleplerini getir
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM [dbo].[HelpRequests] 
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Help requests getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tek bir yardım talebini getir
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('SELECT * FROM [dbo].[HelpRequests] WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Yardım talebi bulunamadı' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Help request getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni yardım talebi oluştur ve provider'ları güncelle
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      location,
      latitude,
      longitude,
      status,
      priority,
      categories,
      needs,
    } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('userId', userId || null)
      .input('title', title)
      .input('description', description || '')
      .input('location', location)
      .input('latitude', latitude)
      .input('longitude', longitude)
      .input('status', status || 'Kritik')
      .input('priority', priority || 'Kritik')
      .input('categories', categories ? JSON.stringify(categories) : null)
      .input('needs', needs ? JSON.stringify(needs) : null)
      .query(`
        INSERT INTO [dbo].[HelpRequests] 
        (UserId, Title, Description, Location, Latitude, Longitude, Status, Priority, Categories, Needs)
        OUTPUT INSERTED.*
        VALUES (@userId, @title, @description, @location, @latitude, @longitude, @status, @priority, @categories, @needs)
      `);

    // 81 ilde provider zaten mevcut, güncelleme gerekmez

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Help request oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yardım talebini güncelle ve kaynakları azalt
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      latitude,
      longitude,
      status,
      priority,
      categories,
      needs,
      resourceId, // Hangi provider'dan yardım gönderildiği
      waterAmount, // Gönderilen su miktarı
      blanketAmount, // Gönderilen battaniye miktarı
      foodAmount, // Gönderilen yemek miktarı
    } = req.body;

    const pool = await getPool();
    
    // Önce mevcut durumu al
    const currentRequest = await pool.request()
      .input('id', id)
      .query('SELECT * FROM [dbo].[HelpRequests] WHERE Id = @id');
    
    if (currentRequest.recordset.length === 0) {
      return res.status(404).json({ error: 'Yardım talebi bulunamadı' });
    }

    const oldStatus = currentRequest.recordset[0].Status;
    const newStatus = status;

    // Durum "Güvende"ye geçtiyse ve önceden "Yardım Gönderiliyor" idi, kaynakları azalt
    if (newStatus === 'Güvende' && oldStatus === 'Yardım Gönderiliyor' && resourceId) {
      // Provider'ı getir
      const provider = await pool.request()
        .input('resourceId', resourceId)
        .query('SELECT * FROM [dbo].[Resources] WHERE Id = @resourceId');

      if (provider.recordset.length > 0) {
        const providerData = provider.recordset[0];
        
        // Gönderilen miktarları hesapla
        let waterToDeduct = waterAmount || 0;
        let blanketToDeduct = blanketAmount || 0;
        let foodToDeduct = foodAmount || 0;
        
        // Eğer miktar belirtilmemişse, ihtiyaçlara göre hesapla
        if (!waterAmount && !blanketAmount && !foodAmount) {
          const needsArray = needs ? (Array.isArray(needs) ? needs : JSON.parse(needs)) : [];
          const currentNeeds = currentRequest.recordset[0].Needs 
            ? (typeof currentRequest.recordset[0].Needs === 'string' 
                ? JSON.parse(currentRequest.recordset[0].Needs) 
                : currentRequest.recordset[0].Needs)
            : needsArray;

          currentNeeds.forEach((need) => {
            const needLower = need.toLowerCase();
            if (needLower.includes('su') || needLower.includes('içecek')) {
              waterToDeduct += 1;
            }
            if (needLower.includes('battaniye') || needLower.includes('çadır')) {
              blanketToDeduct += 1;
            }
            if (needLower.includes('yemek') || needLower.includes('yiyecek') || needLower.includes('ekmek') || needLower.includes('gıda')) {
              foodToDeduct += 1;
            }
          });
        }
        
        // Kaynakları azalt
        let waterCount = Math.max(0, (providerData.WaterCount || 0) - waterToDeduct);
        let blanketCount = Math.max(0, (providerData.BlanketCount || 0) - blanketToDeduct);
        let foodCount = Math.max(0, (providerData.FoodCount || 0) - foodToDeduct);

        // Provider kaynaklarını güncelle
        await pool.request()
          .input('resourceId', resourceId)
          .input('waterCount', waterCount)
          .input('blanketCount', blanketCount)
          .input('foodCount', foodCount)
          .input('quantity', waterCount + blanketCount + foodCount)
          .input('available', waterCount + blanketCount + foodCount)
          .query(`
            UPDATE [dbo].[Resources]
            SET WaterCount = @waterCount,
                BlanketCount = @blanketCount,
                FoodCount = @foodCount,
                Quantity = @quantity,
                Available = @available,
                UpdatedAt = GETDATE()
            WHERE Id = @resourceId
          `);
          
        console.log(`Provider ${resourceId} kaynaklari guncellendi: Su -${waterToDeduct}, Battaniye -${blanketToDeduct}, Yemek -${foodToDeduct}`);
      }
    }

    // Yardım talebini güncelle
    const result = await pool.request()
      .input('id', id)
      .input('title', title)
      .input('description', description)
      .input('location', location)
      .input('latitude', latitude)
      .input('longitude', longitude)
      .input('status', newStatus)
      .input('priority', priority)
      .input('categories', categories ? JSON.stringify(categories) : null)
      .input('needs', needs ? JSON.stringify(needs) : null)
      .query(`
        UPDATE [dbo].[HelpRequests]
        SET Title = @title,
            Description = @description,
            Location = @location,
            Latitude = @latitude,
            Longitude = @longitude,
            Status = @status,
            Priority = @priority,
            Categories = @categories,
            Needs = @needs,
            UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Yardım talebi bulunamadı' });
    }

    // 81 ilde provider zaten mevcut, güncelleme gerekmez

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Help request güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yardım talebini sil
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM [dbo].[HelpRequests] WHERE Id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Yardım talebi bulunamadı' });
    }

    // 81 ilde provider zaten mevcut, güncelleme gerekmez

    res.json({ message: 'Yardım talebi başarıyla silindi' });
  } catch (error) {
    console.error('Help request silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
