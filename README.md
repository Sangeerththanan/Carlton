# Carlton Customer Self Service System

A comprehensive travel management system featuring flight booking, user authentication, and holiday packages management.

## Project Structure

```
Carlton/
├── backend/                 # ASP.NET Core Web API (.NET 10)
│   └── Carlton.CustomerSelfService/
├── frontend/                # React + TypeScript + Vite + Tailwind CSS
│   └── src/
└── README.md               # This file
```

## Prerequisites

### Backend
- .NET 10 SDK
- SQL Server (LocalDB or full SQL Server)
- Entity Framework Core CLI tools

### Frontend
- Node.js 18+ or 20+
- pnpm (recommended) or npm/yarn

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Carlton
```

### 2. Backend Setup

```bash
cd backend/Carlton.CustomerSelfService/Carlton.CustomerSelfService

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install
# or
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL
VITE_API_BASE_URL=http://localhost:5193/api
```

## Database Migration

### Using Entity Framework Migrations

```bash
cd backend/Carlton.CustomerSelfService/Carlton.CustomerSelfService

# Apply migrations to create/update database schema
dotnet ef database update --context ApplicationDbContext

# If you need to create a new migration
dotnet ef migrations add <MigrationName> --context ApplicationDbContext
```

### Handling Migration Conflicts (Development Only)

If you encounter migration conflicts when working in a team, you can drop and recreate the database in development:

```bash
# Drop the existing database (WARNING: This deletes all data)
dotnet ef database drop --context ApplicationDbContext

# Recreate the database with the latest migration
dotnet ef database update --context ApplicationDbContext
```

**Note:** Only use the drop command in development. Never drop a production database.

### Connection String

Update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=CarltonDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

For local development, you can use:
- LocalDB: `Server=(localdb)\\mssqllocaldb;Database=CarltonDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true`
- SQL Server: `Server=YOUR_SERVER_NAME;Database=CarltonDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true`

## Starting the Project

### Start Backend

```bash
cd backend/Carlton.CustomerSelfService/Carlton.CustomerSelfService

# Run the API
dotnet run
```

The backend will be available at:
- HTTP: `http://localhost:5193`
- HTTPS: `https://localhost:7279`
- Swagger UI: `https://localhost:7279/swagger`

### Start Frontend

```bash
cd frontend

# Run the development server
pnpm dev
# or
npm run dev
```

The frontend will be available at:
- `http://localhost:5173`

## Demo User Credentials

### Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Name:** Admin User
- **Role:** Admin

### Ticket Officer
- **Username:** `ticket`
- **Password:** `ticket123`
- **Name:** John Ticket
- **Role:** Ticket Officer

### Finance Officer
- **Username:** `finance`
- **Password:** `finance123`
- **Name:** Sarah Finance
- **Role:** Finance Officer

### Operations Manager
- **Username:** `operations`
- **Password:** `ops123`
- **Name:** Mike Operations
- **Role:** Operations Manager

### Customer Users
- **Username:** `customer1`
- **Password:** `customer123`
- **Name:** Alice Johnson
- **Role:** Customer

- **Username:** `customer2`
- **Password:** `customer123`
- **Name:** Bob Smith
- **Role:** Customer

## Project Features

### Backend (ASP.NET Core Web API)
- **.NET 10** with latest features
- **Entity Framework Core** for database operations
- **JWT Authentication** for secure API access
- **Swagger/OpenAPI** for API documentation
- **CORS** enabled for frontend integration
- **Feature-based architecture** for maintainability

### Frontend (React + TypeScript)
- **Vite** for fast development
- **Tailwind CSS** for modern styling
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- **Component-based architecture**
- **Responsive design** for all devices

### Key Features
1. **User Authentication** - Login with JWT tokens
2. **Flight Management** - Search, view, and manage flights
3. **Holiday Packages** - Browse and book holiday packages
4. **Booking System** - Create and manage flight bookings
5. **User Profiles** - Manage user information and preferences

## API Endpoints

### Authentication
- `POST /api/Auth/login` - User login
- `GET /api/Auth/me` - Get current user info

### Flights
- `GET /api/flights` - Get all flights
- `GET /api/flights/{id}` - Get flight by ID
- `POST /api/flights` - Create new flight (Admin only)
- `PUT /api/flights/{id}` - Update flight (Admin only)
- `DELETE /api/flights/{id}` - Delete flight (Admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5193/api
```

### Backend (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "YourSecretKeyHere",
    "Issuer": "CarltonAirport",
    "Audience": "CarltonAirportUsers",
    "ExpirationMinutes": "60"
  },
  "ConnectionStrings": {
    "DefaultConnection": "YourConnectionString"
  }
}
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
1. Backend is running
2. CORS is configured in `Program.cs`
3. Frontend API URL matches backend URL

### Database Connection Issues
1. Verify SQL Server is running
2. Check connection string in `appsettings.json`
3. Ensure you have necessary permissions

### Build Errors
1. Run `dotnet restore` in backend
2. Run `pnpm install` in frontend
3. Clear caches if needed

## Development Workflow

1. Make changes to backend/frontend
2. Backend: `dotnet build` and `dotnet run`
3. Frontend: `pnpm dev` (hot reload enabled)
4. Test changes in browser at `http://localhost:5173`

## Production Deployment

### Backend
1. Update connection strings for production
2. Set environment variables for JWT
3. Build: `dotnet publish -c Release`
4. Deploy to IIS, Azure, or other hosting

### Frontend
1. Update `VITE_API_BASE_URL` for production
2. Build: `pnpm build`
3. Deploy `dist/` folder to web server

## License

© 2024 Carlton Leisure. All rights reserved.
