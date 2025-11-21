-- CareLinkDB Veritabanını Oluştur
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CareLinkDB')
BEGIN
    CREATE DATABASE CareLinkDB;
END
GO

USE CareLinkDB;
GO

-- Users Tablosu
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
GO

-- UserStatuses Tablosu
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
GO

-- HelpRequests Tablosu
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
GO

-- Resources Tablosu
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
        [Status] NVARCHAR(50) DEFAULT 'Aktif',
        [CreatedAt] DATETIME2 DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Assignments Tablosu
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
GO

-- Messages Tablosu
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
GO

-- Alerts Tablosu
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
GO

PRINT 'CareLinkDB veritabanı ve tablolar başarıyla oluşturuldu!';
GO

