import sql from 'mssql';

const masterConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: 'master',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'CareLink123!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

const dbConfig = {
  ...masterConfig,
  database: 'CareLinkDB',
};

export const initDatabase = async () => {
  let masterPool = null;
  let dbPool = null;
  
  try {
    console.log('Veritabanı başlatılıyor...');
    
    // Master veritabanına bağlan
    masterPool = await sql.connect(masterConfig);
    console.log('Master veritabanına bağlandı.');

    // Veritabanının var olup olmadığını kontrol et
    const dbCheck = await masterPool.request().query(`
      SELECT name FROM sys.databases WHERE name = 'CareLinkDB'
    `);

    if (dbCheck.recordset.length === 0) {
      console.log('CareLinkDB veritabanı oluşturuluyor...');
      await masterPool.request().query('CREATE DATABASE CareLinkDB');
      console.log('CareLinkDB veritabanı oluşturuldu.');
    } else {
      console.log('CareLinkDB veritabanı zaten mevcut.');
    }

    await masterPool.close();
    masterPool = null;

    // CareLinkDB'ye bağlan ve tabloları oluştur
    dbPool = await sql.connect(dbConfig);
    console.log('CareLinkDB veritabanına bağlandı.');

    // Tabloları oluştur (IF NOT EXISTS kontrolü ile)
    await createTables(dbPool);

    await dbPool.close();
    dbPool = null;
    console.log('Veritabanı başlatma tamamlandı.');
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    if (masterPool) await masterPool.close();
    if (dbPool) await dbPool.close();
    throw error;
  }
};

const createTables = async (pool) => {
  const tables = [
    {
      name: 'Users',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[Users] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [Name] NVARCHAR(100) NOT NULL,
            [Email] NVARCHAR(100) UNIQUE NOT NULL,
            [Phone] NVARCHAR(20),
            [Role] NVARCHAR(50) DEFAULT 'user',
            [CreatedAt] DATETIME2 DEFAULT GETDATE(),
            [UpdatedAt] DATETIME2 DEFAULT GETDATE()
          );
        END
      `,
    },
    {
      name: 'UserStatuses',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserStatuses]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[UserStatuses] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [UserId] INT NOT NULL,
            [Status] NVARCHAR(50) NOT NULL,
            [Location] NVARCHAR(200),
            [Latitude] FLOAT,
            [Longitude] FLOAT,
            [LastUpdated] DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
          );
        END
      `,
    },
    {
      name: 'HelpRequests',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HelpRequests]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[HelpRequests] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [UserId] INT,
            [Title] NVARCHAR(200) NOT NULL,
            [Description] NVARCHAR(MAX),
            [Location] NVARCHAR(200) NOT NULL,
            [Latitude] FLOAT NOT NULL,
            [Longitude] FLOAT NOT NULL,
            [Status] NVARCHAR(50) DEFAULT 'Aktif',
            [Priority] NVARCHAR(50) DEFAULT 'Normal',
            [Categories] NVARCHAR(500),
            [Needs] NVARCHAR(500),
            [CreatedAt] DATETIME2 DEFAULT GETDATE(),
            [UpdatedAt] DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
          );
        END
      `,
    },
    {
      name: 'Resources',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Resources]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[Resources] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [Name] NVARCHAR(200) NOT NULL,
            [Type] NVARCHAR(100) NOT NULL,
            [Description] NVARCHAR(MAX),
            [Location] NVARCHAR(200) NOT NULL,
            [Latitude] FLOAT NOT NULL,
            [Longitude] FLOAT NOT NULL,
            [Quantity] INT DEFAULT 0,
            [Available] INT DEFAULT 0,
            [WaterCount] INT DEFAULT 0,
            [BlanketCount] INT DEFAULT 0,
            [FoodCount] INT DEFAULT 0,
            [Status] NVARCHAR(50) DEFAULT 'Aktif',
            [CreatedAt] DATETIME2 DEFAULT GETDATE(),
            [UpdatedAt] DATETIME2 DEFAULT GETDATE()
          );
        END
        ELSE
        BEGIN
          -- Mevcut tabloya kolonlar ekle (eğer yoksa)
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Resources]') AND name = 'WaterCount')
          BEGIN
            ALTER TABLE [dbo].[Resources] ADD [WaterCount] INT DEFAULT 0;
          END
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Resources]') AND name = 'BlanketCount')
          BEGIN
            ALTER TABLE [dbo].[Resources] ADD [BlanketCount] INT DEFAULT 0;
          END
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Resources]') AND name = 'FoodCount')
          BEGIN
            ALTER TABLE [dbo].[Resources] ADD [FoodCount] INT DEFAULT 0;
          END
        END
      `,
    },
    {
      name: 'Assignments',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Assignments]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[Assignments] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [HelpRequestId] INT NOT NULL,
            [ResourceId] INT,
            [AssignedUserId] INT,
            [Status] NVARCHAR(50) DEFAULT 'Atandı',
            [AssignedAt] DATETIME2 DEFAULT GETDATE(),
            [CompletedAt] DATETIME2,
            FOREIGN KEY ([HelpRequestId]) REFERENCES [dbo].[HelpRequests]([Id]),
            FOREIGN KEY ([ResourceId]) REFERENCES [dbo].[Resources]([Id]),
            FOREIGN KEY ([AssignedUserId]) REFERENCES [dbo].[Users]([Id])
          );
        END
      `,
    },
    {
      name: 'Messages',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[Messages] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [FromUserId] INT,
            [ToUserId] INT,
            [HelpRequestId] INT,
            [Message] NVARCHAR(MAX) NOT NULL,
            [Read] BIT DEFAULT 0,
            [CreatedAt] DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY ([FromUserId]) REFERENCES [dbo].[Users]([Id]),
            FOREIGN KEY ([ToUserId]) REFERENCES [dbo].[Users]([Id]),
            FOREIGN KEY ([HelpRequestId]) REFERENCES [dbo].[HelpRequests]([Id])
          );
        END
      `,
    },
    {
      name: 'Alerts',
      sql: `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Alerts]') AND type in (N'U'))
        BEGIN
          CREATE TABLE [dbo].[Alerts] (
            [Id] INT IDENTITY(1,1) PRIMARY KEY,
            [Title] NVARCHAR(200) NOT NULL,
            [Message] NVARCHAR(MAX) NOT NULL,
            [Type] NVARCHAR(50) NOT NULL,
            [Severity] NVARCHAR(50) DEFAULT 'Info',
            [Location] NVARCHAR(200),
            [Latitude] FLOAT,
            [Longitude] FLOAT,
            [Active] BIT DEFAULT 1,
            [CreatedAt] DATETIME2 DEFAULT GETDATE(),
            [ExpiresAt] DATETIME2
          );
        END
      `,
    },
  ];

  for (const table of tables) {
    try {
      await pool.request().query(table.sql);
      console.log(`${table.name} tablosu kontrol edildi/oluşturuldu.`);
    } catch (error) {
      console.warn(`${table.name} tablosu oluşturulurken hata (muhtemelen zaten var):`, error.message);
    }
  }
};

