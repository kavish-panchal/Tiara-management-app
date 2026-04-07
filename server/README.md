# Backend Server - Inventory Management App

## 🚀 Quick Start

### 1. Install MongoDB

Make sure MongoDB is installed and running on your system.

**Windows:**

- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Mac:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Default configuration:

- PORT: 5000
- MONGODB_URI: mongodb://localhost:27017/inventory-management
- JWT_SECRET: (change this in production!)

### 3. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server will run at: `http://localhost:5000`

---

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── orderController.js    # Order business logic
├── models/
│   └── Order.js              # Order schema
├── routes/
│   └── orderRoutes.js        # Order API routes
├── .env                      # Environment variables
├── .env.example              # Environment template
├── server.js                 # Entry point
└── package.json
```

---

## 🔌 API Endpoints

### Orders

#### Get All Orders

```
GET /api/orders
```

#### Get Single Order

```
GET /api/orders/:id
```

#### Create Order

```
POST /api/orders
Content-Type: application/json

{
  "partyName": "ABC Company",
  "orderDate": "2026-02-09",
  "dueDate": "2026-02-20",
  "specialNotes": "Optional notes here",
  "designs": [
    {
      "skuCode": "SKU001",
      "sizeBreakdown": [
        { "size": "2", "sets": 5 },
        { "size": "6", "sets": 10 }
      ]
    }
  ]
}
```

#### Update Order

```
PUT /api/orders/:id
Content-Type: application/json

{
  "partyName": "Updated Name",
  "status": "in-production"
}
```

#### Delete Order

```
DELETE /api/orders/:id
```

#### Update Production Stage

```
PUT /api/orders/:orderId/designs/:designId/production/:stageName
Content-Type: application/json

{
  "status": "in-progress",
  "labour": "John Doe",
  "startDate": "2026-02-09",
  "finishDate": null
}
```

### Production Stages (Settings)

#### Get All Production Stages

```
GET /api/settings/production-stages
```

#### Get Single Production Stage

```
GET /api/settings/production-stages/:id
```

#### Create Production Stage

```
POST /api/settings/production-stages
Content-Type: application/json

{
  "stageName": "Polishing",
  "order": 1,
  "active": true,
  "description": "Optional description"
}
```

#### Update Production Stage

```
PUT /api/settings/production-stages/:id
Content-Type: application/json

{
  "stageName": "Updated Name",
  "order": 2,
  "active": false
}
```

#### Delete Production Stage

```
DELETE /api/settings/production-stages/:id
```

#### Reorder Production Stages

```
PUT /api/settings/production-stages/reorder
Content-Type: application/json

{
  "stages": [
    { "id": "stage_id_1", "order": 0 },
    { "id": "stage_id_2", "order": 1 },
    { "id": "stage_id_3", "order": 2 }
  ]
}
```

### Health Check

```
GET /api/health
```

---

## 📊 Data Models

### Order Schema

```javascript
{
  partyName: String (required),
  orderDate: Date (required),
  dueDate: Date (required),
  specialNotes: String,
  status: String (pending|in-production|completed|delivered),
  designs: [
    {
      skuCode: String (required),
      sizeBreakdown: [
        {
          size: String,
          sets: Number
        }
      ],
      productionProgress: [
        {
          stageName: String,
          status: String (not-started|in-progress|completed),
          labour: String,
          startDate: Date,
          finishDate: Date
        }
      ]
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### ProductionStage Schema

```javascript
{
  stageName: String (required, unique),
  order: Number (required, default: 0),
  active: Boolean (default: true),
  description: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## ✅ Testing the API

You can test the API using:

- **Postman** - Import the endpoints above
- **Thunder Client** (VS Code extension)
- **curl** commands
- **Frontend** - The React app is already configured to use this API

---

## 🔧 Troubleshooting

### MongoDB Connection Error

- Make sure MongoDB is running: `mongod` or check service status
- Verify connection string in `.env`

### Port Already in Use

- Change PORT in `.env` to another port (e.g., 5001)
- Update frontend `.env` to match: `VITE_API_URL=http://localhost:5001/api`

### CORS Errors

- CORS is already configured to allow all origins in development
- For production, update CORS settings in `server.js`

---

## 🎯 Next Steps

- ✅ Orders API is complete and ready
- ⏳ Add Authentication middleware
- ⏳ Add User management API
- ⏳ Add Settings API (Production Stages)
- ⏳ Add Inventory API
- ⏳ Add Reports API
- ⏳ Add Dashboard stats API
