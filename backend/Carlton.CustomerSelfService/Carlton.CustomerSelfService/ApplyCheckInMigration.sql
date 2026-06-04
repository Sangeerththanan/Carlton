-- Mark all existing migrations as applied (they already exist in the DB schema)
-- This prevents EF from trying to re-run them
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260504080309_UpdateSchema')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260504080309_UpdateSchema', '9.0.5');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260505034059_PendingChanges')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260505034059_PendingChanges', '9.0.5');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260507142136_InitialCreate_Phase1to16')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260507142136_InitialCreate_Phase1to16', '9.0.5');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260508031809_UpdateProfileFeatureToIndustrialSchemaV3')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260508031809_UpdateProfileFeatureToIndustrialSchemaV3', '9.0.5');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260508035404_IncreaseDeviceInfoLength')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260508035404_IncreaseDeviceInfoLength', '9.0.5');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260508061214_Phase17_SearchTables')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260508061214_Phase17_SearchTables', '9.0.5');

-- Now apply the actual new columns (idempotent)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'IsCheckedIn')
    ALTER TABLE [Bookings] ADD [IsCheckedIn] bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'SeatNumber')
    ALTER TABLE [Bookings] ADD [SeatNumber] nvarchar(10) NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'CheckedInAt')
    ALTER TABLE [Bookings] ADD [CheckedInAt] datetime2 NULL;

-- Mark our new migration as applied
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260512213828_AddCheckInFieldsToBooking')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260512213828_AddCheckInFieldsToBooking', '9.0.5');
