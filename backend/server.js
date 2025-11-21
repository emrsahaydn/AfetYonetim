import express from 'express';
import cors from 'cors';
import { getPool, closePool } from './config/database.js';
import { initDatabase } from './config/initDatabase.js';
import { seedProviders81Cities } from './scripts/seedProviders81Cities.js';
import { cleanupDatabase } from './scripts/cleanupDatabase.js';
import helpRequestsRoutes from './routes/helpRequests.js';
import resourcesRoutes from './routes/resources.js';
import usersRoutes from './routes/users.js';
import alertsRoutes from './routes/alerts.js';
import assignmentsRoutes from './routes/assignments.js';
import messagesRoutes from './routes/messages.js';
import distanceRoutes from './routes/distance.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Veritabanını başlat ve bağlantıyı kur
const startServer = async () => {
  try {
    // Önce veritabanını başlat
    await initDatabase();
    
    // Sonra bağlantıyı kur
    await getPool();
    
    // İlk başlatmada 81 ilde provider oluştur
    try {
      await seedProviders81Cities();
      console.log('81 ilde provider olusturuldu.');
    } catch (err) {
      console.warn('Provider olusturma hatasi (devam ediliyor):', err.message);
    }
    
    console.log('Sunucu başlatılıyor...');
    app.listen(PORT, () => {
      console.log(`Backend sunucu ${PORT} portunda çalışıyor`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Sunucu başlatma hatası:', err);
    process.exit(1);
  }
};

startServer();

// Routes
app.use('/api/help-requests', helpRequestsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/distance', distanceRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as test');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CareLink Backend API',
    version: '1.0.0',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM sinyali alındı, sunucu kapatılıyor...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT sinyali alındı, sunucu kapatılıyor...');
  await closePool();
  process.exit(0);
});


