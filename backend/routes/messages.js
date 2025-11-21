import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Tüm mesajları getir
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM [dbo].[Messages] 
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Messages getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni mesaj oluştur
router.post('/', async (req, res) => {
  try {
    const { fromUserId, toUserId, helpRequestId, message } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('fromUserId', fromUserId || null)
      .input('toUserId', toUserId || null)
      .input('helpRequestId', helpRequestId || null)
      .input('message', message)
      .query(`
        INSERT INTO [dbo].[Messages] 
        (FromUserId, ToUserId, HelpRequestId, Message)
        OUTPUT INSERTED.*
        VALUES (@fromUserId, @toUserId, @helpRequestId, @message)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Message oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

