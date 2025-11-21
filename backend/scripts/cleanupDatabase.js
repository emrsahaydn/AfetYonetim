import { getPool } from '../config/database.js';

// Veritabanını temizle ve düzenle
export const cleanupDatabase = async () => {
  try {
    const pool = await getPool();
    
    console.log('Veritabanı temizleniyor...');
    
    // 1. Tüm yardım taleplerini sil
    await pool.request().query('DELETE FROM [dbo].[HelpRequests]');
    console.log('Tüm yardım talepleri silindi.');
    
    // 2. Provider'ları sil
    await pool.request().query("DELETE FROM [dbo].[Resources] WHERE Type = 'Provider'");
    console.log('Tum providerlar silindi.');
    
    console.log('Veritabanı temizlendi.');
  } catch (error) {
    console.error('Veritabanı temizleme hatası:', error);
    throw error;
  }
};

