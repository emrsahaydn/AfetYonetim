import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Tüm atamaları getir
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM [dbo].[Assignments] 
      ORDER BY AssignedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Assignments getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni atama oluştur
router.post('/', async (req, res) => {
  try {
    const { helpRequestId, resourceId, assignedUserId, status } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input('helpRequestId', helpRequestId)
      .input('resourceId', resourceId || null)
      .input('assignedUserId', assignedUserId || null)
      .input('status', status || 'Atandı')
      .query(`
        INSERT INTO [dbo].[Assignments] 
        (HelpRequestId, ResourceId, AssignedUserId, Status)
        OUTPUT INSERTED.*
        VALUES (@helpRequestId, @resourceId, @assignedUserId, @status)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Assignment oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

