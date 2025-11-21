import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Tüm uyarıları getir
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM [dbo].[Alerts] 
      WHERE Active = 1
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Alerts getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni uyarı oluştur
router.post('/', async (req, res) => {
  try {
    const { title, message, type, severity, location, latitude, longitude, expiresAt } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('title', title)
      .input('message', message)
      .input('type', type)
      .input('severity', severity || 'Info')
      .input('location', location || null)
      .input('latitude', latitude || null)
      .input('longitude', longitude || null)
      .input('expiresAt', expiresAt || null)
      .query(`
        INSERT INTO [dbo].[Alerts] 
        (Title, Message, Type, Severity, Location, Latitude, Longitude, ExpiresAt)
        OUTPUT INSERTED.*
        VALUES (@title, @message, @type, @severity, @location, @latitude, @longitude, @expiresAt)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Alert oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

