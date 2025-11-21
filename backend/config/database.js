import sql from 'mssql';

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'CareLinkDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'CareLink123!',
  options: {
    encrypt: false, // Docker içinde false olabilir
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

export const getPool = async () => {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(config);
    console.log('MSSQL veritabanına başarıyla bağlandı!');
    return pool;
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    throw error;
  }
};

export const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Veritabanı bağlantısı kapatıldı.');
    }
  } catch (error) {
    console.error('Veritabanı kapatma hatası:', error);
  }
};

export default { getPool, closePool };

