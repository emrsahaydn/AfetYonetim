import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Haversine formülü ile iki nokta arası mesafe hesaplama (km)
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

// Yardım talebine en yakın provider'ları bul
router.get('/nearest-providers/:helpRequestId', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Yardım talebini getir
    const helpRequestResult = await pool.request()
      .input('id', req.params.helpRequestId)
      .query('SELECT Latitude, Longitude FROM [dbo].[HelpRequests] WHERE Id = @id');
    
    if (helpRequestResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Yardım talebi bulunamadı' });
    }
    
    const helpRequest = helpRequestResult.recordset[0];
    const helpLat = helpRequest.Latitude;
    const helpLon = helpRequest.Longitude;
    
    // Yardım talebinin şehrine yakın provider'ları getir (50km içinde)
    const providersResult = await pool.request().query(`
      SELECT Id, Name, Location, Latitude, Longitude, WaterCount, BlanketCount, FoodCount, Status
      FROM [dbo].[Resources]
      WHERE Type = 'Provider' AND Status = 'Aktif'
    `);
    
    // Her provider için mesafe hesapla ve sırala
    let providersWithDistance = providersResult.recordset.map(provider => {
      const distance = calculateDistance(
        helpLat,
        helpLon,
        provider.Latitude,
        provider.Longitude
      );
      return {
        ...provider,
        distance: Math.round(distance * 10) / 10, // 1 ondalık basamak
      };
    });
    
    // Mesafeye göre sırala
    providersWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Önce aynı şehirdeki provider'ları önceliklendir, sonra en yakın 5'i göster
    const sameCityProviders = providersWithDistance.filter(p => 
      Math.round(p.distance) === 0 || p.distance < 10
    );
    
    // Aynı şehirde provider varsa onları önceliklendir, yoksa en yakın 5'i göster
    const recommendedProviders = sameCityProviders.length > 0 
      ? sameCityProviders.slice(0, 5)
      : providersWithDistance.slice(0, 5);
    
    res.json(recommendedProviders);
  } catch (error) {
    console.error('Mesafe hesaplama hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// İki koordinat arası mesafe hesapla
router.get('/calculate', async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;
    
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({ error: 'Tüm koordinatlar gerekli' });
    }
    
    const distance = calculateDistance(
      parseFloat(lat1),
      parseFloat(lon1),
      parseFloat(lat2),
      parseFloat(lon2)
    );
    
    res.json({
      distance: Math.round(distance * 10) / 10,
      unit: 'km',
    });
  } catch (error) {
    console.error('Mesafe hesaplama hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

