import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Tüm kullanıcıları getir
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM [dbo].[Users] 
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Users getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tek bir kullanıcıyı getir
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', req.params.id)
      .query('SELECT * FROM [dbo].[Users] WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('User getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni kullanıcı oluştur
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('name', name)
      .input('email', email)
      .input('phone', phone || null)
      .input('role', role || 'user')
      .query(`
        INSERT INTO [dbo].[Users] (Name, Email, Phone, Role)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @phone, @role)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('User oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

