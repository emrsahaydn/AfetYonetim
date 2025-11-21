import express from 'express';
import { cleanupDatabase } from '../scripts/cleanupDatabase.js';
import { seedProviders } from '../scripts/seedProviders.js';
import { seedProvidersTurkey } from '../scripts/seedProvidersTurkey.js';
import { getPool } from '../config/database.js';

const router = express.Router();

// Veritabanını temizle
router.post('/cleanup', async (req, res) => {
  try {
    await cleanupDatabase();
    res.json({ message: 'Veritabanı başarıyla temizlendi.' });
  } catch (error) {
    console.error('Temizleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Provider'ları yeniden ekle
router.post('/seed-providers', async (req, res) => {
  try {
    await seedProviders();
    res.json({ message: 'Provider verileri başarıyla eklendi.' });
  } catch (error) {
    console.error('Provider ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yardım taleplerini sil
router.delete('/help-requests', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('DELETE FROM [dbo].[HelpRequests]');
    res.json({ message: 'Tüm yardım talepleri silindi.' });
  } catch (error) {
    console.error('Yardım talepleri silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Provider'ları güncelle (aktif yardım taleplerine göre)
router.post('/update-providers', async (req, res) => {
  try {
    await seedProvidersTurkey();
    res.json({ message: 'Providerlar aktif yardim taleplerine gore guncellendi.' });
  } catch (error) {
    console.error('Provider guncelleme hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

