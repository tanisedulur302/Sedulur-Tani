# E-Commerce Pupuk Backend API

Backend API untuk sistem E-Commerce Pupuk yang dibangun dengan Node.js, Express, TypeScript, dan MongoDB menggunakan Prisma ORM. Aplikasi ini menyediakan RESTful API untuk manajemen produk pupuk, keranjang belanja, checkout, dan sistem pembayaran.

---

## 📋 Daftar Isi

- [Quick Start](#-quick-start)
- [Struktur Folder](#-struktur-folder)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Tech Stack](#️-tech-stack)
- [Autentikasi & Otorisasi](#-autentikasi--otorisasi)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 atau lebih tinggi
- **MongoDB** database (local/MongoDB Atlas)
- **npm** atau **yarn**
- **Git** (optional)

### Installation

**1. Clone repository:**

```bash
git clone <repository-url>
cd Backend
```

**2. Install dependencies:**

```bash
npm install
```

**3. Setup environment variables:**
Buat file `.env` di root folder Backend:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ecommerce_pupuk?retryWrites=true&w=majority"

# JWT Authentication
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=8686
NODE_ENV="development"

# Cloudinary (optional - untuk upload gambar)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Xendit Payment Gateway
XENDIT_API_KEY="xnd_development_your_api_key_here"
XENDIT_WEBHOOK_TOKEN="your_webhook_verification_token_here"
FRONTEND_URL="http://localhost:3000"
```

**4. Generate Prisma Client:**

```bash
npx prisma generate
```

**5. Push database schema (opsional):**

```bash
npx prisma db push
```

**6. Run the server:**

**Development mode** (dengan hot reload):

```bash
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

✅ Server berjalan di: **http://localhost:8686**

---

## 📁 Struktur Folder

```
Backend/
├── src/
│   ├── config/                 # Konfigurasi aplikasi
│   │   └── cloudinary.ts      # Setup Cloudinary untuk upload gambar
│   │
│   ├── controllers/           # HTTP Request Handlers (thin layer)
│   │   ├── AuthController.ts        # Login, register, autentikasi
│   │   ├── UserController.ts        # Manajemen user/profil
│   │   ├── AddressController.ts     # CRUD alamat pengiriman
│   │   ├── ProductController.ts     # CRUD produk pupuk
│   │   ├── CartController.ts        # Keranjang belanja
│   │   ├── CheckoutController.ts    # Proses checkout/pembayaran
│   │   └── HomeController.ts        # Homepage/welcome
│   │
│   ├── services/              # Business Logic Layer
│   │   ├── CheckoutService.ts       # Logic checkout & order
│   │   ├── checkout.service.ts      # (duplikat - perlu cleanup)
│   │   ├── CartService.ts           # Logic keranjang belanja
│   │   ├── ProductService.ts        # Logic produk
│   │   └── address.service.ts       # Logic alamat
│   │
│   ├── repositories/          # Database Access Layer
│   │   ├── checkout.repository.ts   # Query checkout & order
│   │   └── address.repository.ts    # Query alamat
│   │
│   ├── routes/                # Route Definitions (API Endpoints)
│   │   ├── routes.ts                # Main router (root)
│   │   ├── auth.routes.ts           # Routes autentikasi
│   │   ├── user.routes.ts           # Routes user
│   │   ├── address.routes.ts        # Routes alamat
│   │   ├── product.routes.ts        # Routes produk
│   │   ├── cart.routes.ts           # Routes cart
│   │   └── checkout.routes.ts       # Routes checkout
│   │
│   ├── middleware/            # Express Middleware
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── roleCheck.ts             # Role-based authorization (buyer/seller)
│   │   ├── upload.ts                # File upload handler
│   │   └── index.ts                 # Middleware exports
│   │
│   ├── validators/            # Input Validation Layer
│   │   ├── CheckoutValidator.ts     # Validasi input checkout
│   │   ├── CartValidator.ts         # Validasi input cart
│   │   └── ProductValidator.ts      # Validasi input produk
│   │
│   ├── types/                 # TypeScript Type Definitions
│   │   ├── auth.types.ts            # Types untuk autentikasi
│   │   ├── user.types.ts            # Types untuk user
│   │   ├── address.types.ts         # Types untuk alamat
│   │   ├── product.types.ts         # Types untuk produk
│   │   ├── cart.types.ts            # Types untuk cart
│   │   └── checkout.types.ts        # Types untuk checkout
│   │
│   ├── utils/                 # Helper Functions & Utilities
│   │   ├── responseFormatter.ts     # Format response API standar
│   │   ├── errorHandler.ts          # Error handling global
│   │   ├── imageUpload.ts           # Helper upload gambar
│   │   ├── uploadHelper.ts          # (duplikat - perlu cleanup)
│   │   ├── shipping.util.ts         # Kalkulasi ongkos kirim
│   │   └── shiping.util.ts          # (typo - perlu cleanup)
│   │
│   └── database/              # Database Configuration
│       ├── prisma.ts                # Prisma client instance
│       └── connection.ts            # Database connection setup
│
├── prisma/
│   └── schema.prisma          # Database schema & models
│
├── models/                    # (Legacy - bisa dihapus jika tidak dipakai)
│
├── dist/                      # Compiled JavaScript (auto-generated)
│
├── index.ts                   # Application Entry Point
├── prisma.config.ts           # Prisma configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
├── .env                       # Environment variables (create manually)
│
└── Documentation Files:
    ├── README.md              # Dokumentasi utama (file ini)
    ├── ARCHITECTURE.md        # Arsitektur sistem
    ├── PRODUCT_API_GUIDE.md   # Panduan API produk
    └── CHECKOUT_API_GUIDE.md  # Panduan API checkout
```

### 📂 Penjelasan Folder

| Folder            | Fungsi                                         |
| ----------------- | ---------------------------------------------- |
| **controllers/**  | Menangani HTTP request & response (thin layer) |
| **services/**     | Business logic & proses bisnis utama           |
| **repositories/** | Query database (Data Access Layer)             |
| **routes/**       | Definisi endpoint API                          |
| **middleware/**   | Fungsi perantara: auth, validation, upload     |
| **validators/**   | Validasi input dari user                       |
| **types/**        | TypeScript type definitions                    |
| **utils/**        | Helper functions & utilities                   |
| **database/**     | Konfigurasi & koneksi database                 |
| **prisma/**       | Schema database & migrations                   |

---

## 🏗️ Arsitektur Aplikasi

Aplikasi ini menggunakan **Layered Architecture** dengan pemisahan tanggung jawab yang jelas:

```mermaid
graph TB
    Client[HTTP Request from Client]
    Routes[Routes Layer<br/>- Definisi endpoint<br/>- Route parameter handling]
    Middleware[Middleware Layer<br/>- Authentication JWT<br/>- Authorization Role check<br/>- Validation<br/>- File upload]
    Controllers[Controllers Layer<br/>- Handle HTTP request/response<br/>- Extract data from request<br/>- Call services<br/>- Format response]
    Services[Services Layer<br/>- Business rules & logic<br/>- Data transformation<br/>- Call repositories<br/>- Transaction management]
    Repositories[Repositories Layer<br/>- Database queries<br/>- CRUD operations<br/>- Data mapping]
    Database[(Database<br/>MongoDB + Prisma)]

    Client --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> Database

    style Client fill:#e1f5ff
    style Routes fill:#fff3cd
    style Middleware fill:#f8d7da
    style Controllers fill:#d4edda
    style Services fill:#d1ecf1
    style Repositories fill:#e2d5f0
    style Database fill:#f5c6cb
```

### Flow Contoh: Create Checkout

```mermaid
sequenceDiagram
    participant Client
    participant Router as checkout.routes.ts
    participant Auth as authMiddleware
    participant Controller as CheckoutController
    participant Service as CheckoutService
    participant Repo as CheckoutRepository
    participant DB as MongoDB

    Client->>Router: POST /checkout
    Router->>Auth: Verify JWT token
    Auth-->>Router: Token valid ✓
    Router->>Controller: createCheckout()
    Controller->>Service: createCheckout(userId, dto)

    Note over Service: Business Logic
    Service->>Service: 1. Validasi alamat
    Service->>Service: 2. Validasi cart
    Service->>Service: 3. Validasi stock
    Service->>Service: 4. Hitung total harga
    Service->>Service: 5. Hitung ongkir

    Service->>Repo: createCheckout(data)
    Repo->>DB: INSERT checkout & orders
    DB-->>Repo: Data saved
    Repo-->>Service: Checkout created
    Service-->>Controller: Result
    Controller-->>Client: JSON Response
```

**Untuk dokumentasi lengkap, lihat:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:8686
```

### Authentication & User

| Method | Endpoint         | Deskripsi                   | Auth | Role  |
| ------ | ---------------- | --------------------------- | ---- | ----- |
| POST   | `/auth/register` | Register user baru          | ❌   | -     |
| POST   | `/auth/login`    | Login user                  | ❌   | -     |
| GET    | `/auth/profile`  | Get user profile            | ✅   | All   |
| GET    | `/me`            | Get current user (shortcut) | ✅   | All   |
| GET    | `/users/:id`     | Get user by ID              | ✅   | All   |
| PUT    | `/users/:id`     | Update user profile         | ✅   | Owner |

### Address Management

| Method | Endpoint         | Deskripsi             | Auth | Role  |
| ------ | ---------------- | --------------------- | ---- | ----- |
| POST   | `/addresses`     | Create alamat baru    | ✅   | All   |
| GET    | `/addresses`     | Get semua alamat user | ✅   | All   |
| GET    | `/addresses/:id` | Get alamat by ID      | ✅   | Owner |
| PUT    | `/addresses/:id` | Update alamat         | ✅   | Owner |
| DELETE | `/addresses/:id` | Delete alamat         | ✅   | Owner |

### Product Management

| Method | Endpoint        | Deskripsi          | Auth | Role           |
| ------ | --------------- | ------------------ | ---- | -------------- |
| POST   | `/products`     | Create produk baru | ✅   | Seller         |
| GET    | `/products`     | Get semua produk   | ❌   | -              |
| GET    | `/products/:id` | Get produk by ID   | ❌   | -              |
| PUT    | `/products/:id` | Update produk      | ✅   | Seller (Owner) |
| DELETE | `/products/:id` | Delete produk      | ✅   | Seller (Owner) |

### Shopping Cart

| Method | Endpoint        | Deskripsi                     | Auth | Role  |
| ------ | --------------- | ----------------------------- | ---- | ----- |
| POST   | `/cart`         | Add produk ke cart            | ✅   | All   |
| GET    | `/cart`         | Get cart dengan items & total | ✅   | All   |
| PUT    | `/cart/:itemId` | Update quantity item          | ✅   | Owner |
| DELETE | `/cart/:itemId` | Remove item dari cart         | ✅   | Owner |

### Checkout & Orders

| Method | Endpoint        | Deskripsi                 | Auth | Role  |
| ------ | --------------- | ------------------------- | ---- | ----- |
| POST   | `/checkout`     | Create checkout dari cart | ✅   | All   |
| GET    | `/checkout/:id` | Get checkout details      | ✅   | Owner |

**Dokumentasi lengkap:**

- [PRODUCT_API_GUIDE.md](./PRODUCT_API_GUIDE.md)
- [CHECKOUT_API_GUIDE.md](./CHECKOUT_API_GUIDE.md)

---

## 💾 Database Schema

### Collections & Models

**🧑 users**

- User accounts (buyers & sellers)
- Password di-hash dengan bcrypt (10 salt rounds)
- Role: `buyer` atau `seller`

**📍 user_addresses**

- Alamat pengiriman user
- Multiple addresses per user
- Support default address

**🌾 products**

- Produk pupuk dari seller
- Data: name, description, price, stock, weight, image
- Relasi: belongs to seller (User)

**🛒 carts**

- Keranjang belanja
- One cart per user
- Relasi: has many cart_items

**📦 cart_items**

- Item dalam cart
- Relasi: belongs to cart & product
- Unique constraint: satu produk per cart

**💰 checkouts**

- Record checkout/transaksi
- Data: total_price, shipping_price, grand_total
- Status: `pending`, `paid`, `expired`

**📋 orders**

- Order individual dari checkout
- Data: quantity, price_each, total_price
- Status: `pending`, `processed`, `shipped`, `completed`, `cancelled`

**🚚 shipments**

- Data pengiriman order
- Data: courier_name, tracking_number
- Status: `packing`, `shipping`, `delivered`

**💳 payments**

- Record pembayaran (Midtrans)
- Data: midtrans_order_id, transaction_status

**🔔 payment_notifications**

- Webhook notifications dari payment gateway

### Database Schema Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ UserAddress : has
    User ||--o{ Product : creates
    User ||--|| Cart : owns
    User ||--o{ Checkout : makes
    User ||--o{ Order : places

    Cart ||--o{ CartItem : contains
    Product ||--o{ CartItem : "added to"
    Product ||--o{ Order : "ordered in"

    Checkout ||--o{ Order : includes
    Checkout ||--o{ Payment : has

    Order ||--o{ Shipment : "shipped via"

    Payment ||--o{ PaymentNotification : receives

    User {
        string id PK
        string name
        string email UK
        string password_hash
        string phone
        enum role
        datetime created_at
        datetime updated_at
    }

    UserAddress {
        string id PK
        string user_id FK
        string label
        string recipient_name
        string phone
        string address_line
        string city
        string province
        string postal_code
        boolean is_default
        datetime created_at
        datetime updated_at
    }

    Product {
        string id PK
        string seller_id FK
        string name
        string description
        int weight
        float price
        int stock
        string image_url
        datetime created_at
        datetime updated_at
    }

    Cart {
        string id PK
        string user_id FK
        datetime created_at
        datetime updated_at
    }

    CartItem {
        string id PK
        string cart_id FK
        string product_id FK
        int quantity
    }

    Checkout {
        string id PK
        string user_id FK
        float total_price
        float shipping_price
        float grand_total
        enum status
        datetime created_at
        datetime updated_at
    }

    Order {
        string id PK
        string checkout_id FK
        string user_id FK
        string product_id FK
        int quantity
        float price_each
        float total_price
        enum status
        datetime created_at
        datetime updated_at
    }

    Shipment {
        string id PK
        string order_id FK
        string courier_name
        string tracking_number
        enum status
        datetime created_at
        datetime updated_at
    }

    Payment {
        string id PK
        string checkout_id FK
        string midtrans_order_id UK
        string transaction_id UK
        float gross_amount
        string payment_type
        string transaction_status
        datetime transaction_time
        datetime created_at
        datetime updated_at
    }

    PaymentNotification {
        string id PK
        string payment_id FK
        string raw_body
        datetime received_at
    }
```

**Full schema:** lihat `prisma/schema.prisma`

---

## 🛠️ Tech Stack

### Backend Framework

- **Node.js** v14+ - JavaScript runtime
- **Express.js** v4 - Web framework
- **TypeScript** v5 - Type-safe JavaScript

### Database

- **MongoDB** - NoSQL database
- **Prisma** v6.19 - Modern ORM & query builder

### Authentication & Security

- **JWT (jsonwebtoken)** - Token-based auth
- **bcrypt** v6 - Password hashing (10 salt rounds)

### File Upload

- **Cloudinary** - Cloud image storage (optional)
- **Streamifier** - Stream handling

### Development Tools

- **nodemon** - Auto-restart server
- **ts-node** - Run TypeScript directly
- **TypeScript** - Type checking

### Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "6.19",
    "bcrypt": "^6.0.0",
    "body-parser": "^1.19.0",
    "dotenv": "^17.2.3",
    "express": "^4.17.1",
    "jsonwebtoken": "^9.0.2",
    "streamifier": "^0.1.1"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.1.11",
    "prisma": "6.19",
    "@types/*": "..."
  }
}
```

---

## 🔐 Autentikasi & Otorisasi

### Authentication Flow

```mermaid
flowchart TD
    Start([User Access App]) --> CheckAuth{Has Token?}
    CheckAuth -->|No| ShowLogin[Show Login/Register Page]
    CheckAuth -->|Yes| ValidateToken[Validate JWT Token]

    ShowLogin --> UserChoice{Choose Action}
    UserChoice -->|Register| Register[POST /auth/register]
    UserChoice -->|Login| Login[POST /auth/login]

    Register --> ValidateInput1{Input Valid?}
    ValidateInput1 -->|No| ShowError1[Show Error]
    ShowError1 --> ShowLogin
    ValidateInput1 -->|Yes| HashPassword[Hash Password with bcrypt]
    HashPassword --> SaveUser[Save to Database]
    SaveUser --> GenerateToken1[Generate JWT Token]
    GenerateToken1 --> ReturnToken1[Return Token + User Data]

    Login --> ValidateInput2{Credentials Valid?}
    ValidateInput2 -->|No| ShowError2[Show Error: Invalid credentials]
    ShowError2 --> ShowLogin
    ValidateInput2 -->|Yes| ComparePassword[Compare Password with bcrypt]
    ComparePassword --> PasswordMatch{Match?}
    PasswordMatch -->|No| ShowError2
    PasswordMatch -->|Yes| GenerateToken2[Generate JWT Token]
    GenerateToken2 --> ReturnToken2[Return Token + User Data]

    ReturnToken1 --> StoreToken[Store Token in Client]
    ReturnToken2 --> StoreToken
    ValidateToken --> TokenValid{Token Valid?}
    TokenValid -->|No| ShowLogin
    TokenValid -->|Yes| StoreToken

    StoreToken --> AccessProtected[Access Protected Routes]
    AccessProtected --> AddHeader[Add Header: Authorization Bearer Token]
    AddHeader --> RequestAPI[Make API Request]
    RequestAPI --> Middleware[authMiddleware validates token]
    Middleware --> Success[✓ Access Granted]

    Success --> End([Continue Using App])

    style Start fill:#e1f5ff
    style End fill:#d4edda
    style ShowError1 fill:#f8d7da
    style ShowError2 fill:#f8d7da
    style Success fill:#d4edda
```

### Authorization Flow (Role-Based Access Control)

```mermaid
flowchart TD
    Request[API Request with Token] --> AuthMiddleware[authMiddleware]
    AuthMiddleware --> CheckToken{Token Exists?}

    CheckToken -->|No| Return401[Return 401 Unauthorized]
    CheckToken -->|Yes| VerifyToken[Verify JWT Token]

    VerifyToken --> TokenValid{Token Valid?}
    TokenValid -->|No| Return401
    TokenValid -->|Yes| DecodeToken[Decode Token]

    DecodeToken --> ExtractUser[Extract user info:<br/>id, email, role]
    ExtractUser --> AttachUser[Attach to req.user]
    AttachUser --> CheckRole{Need Role Check?}

    CheckRole -->|No| AllowAccess[✓ Allow Access]
    CheckRole -->|Yes| RoleMiddleware[roleCheck middleware]

    RoleMiddleware --> CompareRole{Role Matches?}
    CompareRole -->|No| Return403[Return 403 Forbidden]
    CompareRole -->|Yes| AllowAccess

    AllowAccess --> Controller[Execute Controller]
    Controller --> CheckOwnership{Check Ownership?}

    CheckOwnership -->|No| ProcessRequest[Process Request]
    CheckOwnership -->|Yes| VerifyOwner{Is Owner?}

    VerifyOwner -->|No| Return403
    VerifyOwner -->|Yes| ProcessRequest

    ProcessRequest --> ReturnResponse[Return Response]

    style Return401 fill:#f8d7da
    style Return403 fill:#f8d7da
    style AllowAccess fill:#d4edda
    style ReturnResponse fill:#d4edda
```

**1. Register User**

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "08123456789",
  "role": "buyer"  // atau "seller"
}
```

Response:

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "..." },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**2. Login**

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", "name": "John Doe", "role": "buyer" }
  }
}
```

**3. Use Token untuk Request**

```bash
GET /me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authorization (Role-Based)

**Middleware `authMiddleware`**

- Verifikasi JWT token
- Decode user info (id, email, role)
- Attach ke `req.user`

**Middleware `roleCheck`**

- Cek role user: `buyer` atau `seller`
- Block akses jika role tidak sesuai

**Contoh Penggunaan:**

```typescript
// Hanya seller yang bisa create product
router.post(
  "/products",
  authMiddleware,
  roleCheck("seller"),
  ProductController.create
);

// Semua authenticated user bisa akses
router.get("/cart", authMiddleware, CartController.getCart);
```

### Security Features

✅ Password di-hash dengan bcrypt (10 salt rounds)  
✅ JWT token expires dalam 7 hari  
✅ Token validation di setiap protected route  
✅ Role-based access control (RBAC)  
✅ Owner verification (user hanya bisa akses data sendiri)  
✅ Input validation di setiap endpoint

### User Journey: Complete Shopping Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Register[Register/Login]
    Register --> Browse[Browse Products<br/>GET /products]

    Browse --> SelectProduct[Select Product<br/>GET /products/:id]
    SelectProduct --> AddCart[Add to Cart<br/>POST /cart]

    AddCart --> ContinueShopping{Continue Shopping?}
    ContinueShopping -->|Yes| Browse
    ContinueShopping -->|No| ViewCart[View Cart<br/>GET /cart]

    ViewCart --> UpdateCart{Need Update?}
    UpdateCart -->|Yes - Change Qty| UpdateQty[PUT /cart/:itemId]
    UpdateCart -->|Yes - Remove Item| RemoveItem[DELETE /cart/:itemId]
    UpdateQty --> ViewCart
    RemoveItem --> ViewCart
    UpdateCart -->|No| CheckAddress{Has Address?}

    CheckAddress -->|No| AddAddress[Create Address<br/>POST /addresses]
    CheckAddress -->|Yes| SelectAddress[Select Address<br/>GET /addresses]
    AddAddress --> SelectAddress

    SelectAddress --> CreateCheckout[Create Checkout<br/>POST /checkout]
    CreateCheckout --> ValidateStock{Stock Available?}

    ValidateStock -->|No| ShowError[Show Error:<br/>Insufficient Stock]
    ShowError --> ViewCart

    ValidateStock -->|Yes| Calculate[Calculate:<br/>- Total Price<br/>- Shipping Cost<br/>- Grand Total]
    Calculate --> CreateOrder[Create Order Records]
    CreateOrder --> ReduceStock[Reduce Product Stock]
    ReduceStock --> ClearCart[Clear Cart Items]

    ClearCart --> ShowSummary[Show Order Summary<br/>GET /checkout/:id]
    ShowSummary --> ProcessPayment[Process Payment<br/>Future: Midtrans]

    ProcessPayment --> PaymentSuccess{Payment Success?}
    PaymentSuccess -->|No| PaymentFailed[Order Status: Cancelled]
    PaymentSuccess -->|Yes| UpdateStatus[Order Status: Paid]

    UpdateStatus --> PrepareShipment[Prepare Shipment<br/>Future Feature]
    PrepareShipment --> ShipOrder[Ship Order<br/>Future Feature]
    ShipOrder --> TrackOrder[Track Order<br/>Future Feature]
    TrackOrder --> OrderComplete[Order Delivered]

    OrderComplete --> End([End])
    PaymentFailed --> End

    style Start fill:#e1f5ff
    style End fill:#d4edda
    style ShowError fill:#f8d7da
    style PaymentFailed fill:#f8d7da
    style OrderComplete fill:#d4edda
```

---

## 🧪 Testing

### Using cURL

**1. Register:**

```bash
curl -X POST http://localhost:8686/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "buyer"
  }'
```

**2. Login:**

```bash
curl -X POST http://localhost:8686/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**3. Get Profile (butuh token):**

```bash
curl -X GET http://localhost:8686/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**4. Create Product (seller only):**

```bash
curl -X POST http://localhost:8686/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pupuk Urea 50kg",
    "description": "Pupuk berkualitas tinggi",
    "price": 150000,
    "stock": 100,
    "weight": 50000
  }'
```

**5. Add to Cart:**

```bash
curl -X POST http://localhost:8686/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_ID_HERE",
    "quantity": 2
  }'
```

**6. Get Cart:**

```bash
curl -X GET http://localhost:8686/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**7. Create Checkout:**

```bash
curl -X POST http://localhost:8686/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": "ADDRESS_ID_HERE",
    "shipping_method": "JNE REG",
    "notes": "Kirim pagi"
  }'
```

### Using Postman

**1. Setup Environment:**

- Variable: `base_url` = `http://localhost:8686`
- Variable: `token` = (akan di-set otomatis)

**2. Import Endpoints:**

- Create collection "E-Commerce Pupuk API"
- Add requests sesuai endpoint di atas

**3. Set Auth:**

- Tab Authorization → Type: Bearer Token
- Token: `{{token}}`

**4. Auto-set Token:**
Di Tests tab untuk login endpoint:

```javascript
pm.test("Save token", function () {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
});
```

---

## 📝 Available Scripts

```bash
# Development - jalankan server dengan hot reload
npm run dev

# Build - compile TypeScript ke JavaScript
npm run build

# Production - jalankan compiled code
npm start

# Prisma
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema ke database
npx prisma studio        # Open Prisma Studio (GUI)
```

---

## 🌟 Features

### ✅ Implemented

- User registration & authentication (JWT)
- Role-based access control (buyer/seller)
- User profile management
- Address CRUD operations
- Default address management
- Product CRUD (seller only)
- Product search & filtering
- Shopping cart management
- Cart total price calculation
- Checkout processing
- Automatic order creation
- Stock validation & management
- Shipping price calculation (based on weight)
- TypeScript untuk type safety
- Prisma ORM untuk database
- RESTful API design
- Error handling & response formatting

### 🚧 Coming Soon / TODO

- [ ] Payment gateway integration (Midtrans)
- [ ] Payment webhook handling
- [ ] Order status updates
- [ ] Shipment tracking
- [ ] Admin dashboard
- [ ] Product reviews & ratings
- [ ] Wishlist / Save for later
- [ ] Email notifications
- [ ] Forgot password / Reset password
- [ ] Product image upload (Cloudinary)
- [ ] Product categories
- [ ] Search & filter produk advanced
- [ ] Pagination
- [ ] Unit tests & integration tests
- [ ] API rate limiting
- [ ] CORS configuration
- [ ] Logging (Winston/Morgan)

---

## 🐛 Troubleshooting

### Problem: Port already in use

**Solution:**

```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8686).OwningProcess | Stop-Process -Force

# Atau ubah port di index.ts
const PORT = 8787; // ganti ke port lain
```

### Problem: Database connection error

**Solution:**

- Cek `DATABASE_URL` di `.env`
- Pastikan MongoDB running (local) atau cek koneksi internet (Atlas)
- Pastikan IP address di-whitelist di MongoDB Atlas
- Test connection: `npx prisma db push`

### Problem: Prisma Client error

**Solution:**

```bash
# Regenerate Prisma Client
npx prisma generate

# Jika masih error, hapus node_modules dan reinstall
rm -rf node_modules
npm install
npx prisma generate
```

### Problem: JWT Secret not found

**Solution:**

- Pastikan file `.env` ada di root Backend/
- Pastikan `JWT_SECRET` sudah di-set
- Restart server setelah update `.env`

### Problem: Authentication failed / Token invalid

**Solution:**

- Cek format header: `Authorization: Bearer <token>`
- Pastikan token belum expired (default 7 hari)
- Login ulang untuk dapat token baru

### Problem: Role check failed

**Solution:**

- Pastikan user memiliki role yang sesuai
- Seller tidak bisa akses endpoint buyer, vice versa
- Cek di `/me` untuk lihat role user

### Problem: Build errors TypeScript

**Solution:**

```bash
# Cek error detail
npm run build

# Fix dengan TypeScript compiler
npx tsc --noEmit

# Pastikan semua dependencies terinstall
npm install
```

---

## 📄 License

ISC

---

## 👨‍💻 Development Notes

### Known Issues

1. **Duplicate files:**

   - `checkout.service.ts` dan `CheckoutService.ts` → perlu cleanup
   - `shipping.util.ts` dan `shiping.util.ts` (typo) → perlu cleanup
   - `imageUpload.ts` dan `uploadHelper.ts` → perlu cleanup

2. **Architecture inconsistency:**

   - Beberapa service menggunakan repository pattern
   - Beberapa service query langsung ke Prisma
   - Perlu standardisasi

3. **Missing features:**
   - Payment gateway belum diimplementasi
   - Email service belum ada
   - Admin panel belum ada

### Recommended Improvements

- [ ] Cleanup duplicate files
- [ ] Standardize architecture (gunakan repository pattern konsisten)
- [ ] Add input validation middleware
- [ ] Add request/response logging
- [ ] Add unit tests & integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add rate limiting
- [ ] Add CORS configuration
- [ ] Implement caching (Redis)
- [ ] Add database migrations (Prisma Migrate)

---

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**API Version:** 1.0.0  
**Last Updated:** November 21, 2025  
**Maintained by:** Backend Team

---

Built with ❤️ using Node.js, Express, TypeScript, MongoDB, and Prisma ORM.
