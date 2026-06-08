# Shipping API Documentation (RajaOngkir with Caching)

## Overview

API ini menggunakan RajaOngkir untuk menghitung ongkos kirim dengan sistem caching untuk mengoptimalkan performa dan mengurangi API calls.

### Caching Strategy

- **Cache Duration**: 30 hari
- **Cache Key**: MD5 hash dari `origin-destination-weight-courier`
- **Auto Cleanup**: MongoDB TTL index otomatis menghapus cache yang expired
- **Cache Hit**: Return data dari database
- **Cache Miss**: Call RajaOngkir API → Save to cache → Return data

## Setup

### 1. Environment Variables

Tambahkan ke `.env`:

```env
RAJAONGKIR_API_KEY=your_api_key_here
RAJAONGKIR_BASE_URL=https://api.rajaongkir.com/starter
```

### 2. Get RajaOngkir API Key

1. Daftar di https://rajaongkir.com/
2. Pilih paket (Starter/Basic/Pro)
3. Copy API Key

## API Endpoints

### 1. Get Provinces

```http
GET /api/v1/shipping/provinces
```

**Response:**

```json
{
  "success": true,
  "message": "Provinces retrieved successfully",
  "data": [
    {
      "province_id": "1",
      "province": "Bali"
    },
    {
      "province_id": "2",
      "province": "Bangka Belitung"
    }
  ]
}
```

### 2. Get Cities

```http
GET /api/v1/shipping/cities?province_id=9
```

**Query Parameters:**

- `province_id` (optional): Filter cities by province

**Response:**

```json
{
  "success": true,
  "message": "Cities retrieved successfully",
  "data": [
    {
      "city_id": "39",
      "province_id": "9",
      "province": "Jawa Barat",
      "type": "Kabupaten",
      "city_name": "Bandung",
      "postal_code": "40311"
    }
  ]
}
```

### 3. Calculate Shipping Cost (with Caching)

```http
POST /api/v1/shipping/cost
Content-Type: application/json

{
  "origin": "501",
  "destination": "114",
  "weight": 1700,
  "courier": "jne"
}
```

**Request Body:**

- `origin` (string, required): City ID asal
- `destination` (string, required): City ID tujuan
- `weight` (number, required): Berat dalam gram (minimal 1)
- `courier` (string, required): Kode kurir (jne, pos, tiki, jnt, sicepat, anteraja)

**Response (Cache Hit):**

```json
{
  "success": true,
  "message": "Shipping cost calculated successfully",
  "data": {
    "costs": [
      {
        "service": "OKE",
        "description": "Ongkos Kirim Ekonomis",
        "cost": [
          {
            "value": 38000,
            "etd": "4-5",
            "note": ""
          }
        ]
      },
      {
        "service": "REG",
        "description": "Layanan Reguler",
        "cost": [
          {
            "value": 44000,
            "etd": "2-3",
            "note": ""
          }
        ]
      }
    ],
    "fromCache": true,
    "cachedAt": "2025-01-14T10:30:00.000Z",
    "expiresAt": "2025-02-13T10:30:00.000Z"
  }
}
```

**Response (Cache Miss - Fresh from API):**

```json
{
  "success": true,
  "message": "Shipping cost calculated successfully",
  "data": {
    "costs": [...],
    "fromCache": false,
    "cachedAt": "2025-01-14T10:35:00.000Z",
    "expiresAt": "2025-02-13T10:35:00.000Z"
  }
}
```

### 4. Clear Expired Cache (Admin Only)

```http
DELETE /api/v1/shipping/cache/expired
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Cleared 15 expired cache entries",
  "data": {
    "deletedCount": 15
  }
}
```

### 5. Clear All Cache (Admin Only - Testing)

```http
DELETE /api/v1/shipping/cache/all
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Cleared all cache (42 entries)",
  "data": {
    "deletedCount": 42
  }
}
```

## Supported Couriers

- **JNE** - `jne`
- **POS Indonesia** - `pos`
- **TIKI** - `tiki`
- **J&T Express** - `jnt`
- **SiCepat** - `sicepat`
- **AnterAja** - `anteraja`

## Error Handling

### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields: origin, destination, weight, courier"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to calculate shipping cost"
}
```

## Cache Flow Diagram

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Generate Cache Key  │
│ MD5(origin-dest-    │
│     weight-courier) │
└────────┬────────────┘
         │
         ▼
    ┌────────┐
    │ Cache? │
    └───┬────┘
        │
    ┌───┴───┐
    │       │
   YES     NO
    │       │
    │       ▼
    │  ┌──────────────┐
    │  │ Call RajaOngkir│
    │  │     API       │
    │  └──────┬────────┘
    │         │
    │         ▼
    │  ┌──────────────┐
    │  │  Save Cache  │
    │  │ (30 days TTL)│
    │  └──────┬────────┘
    │         │
    └────┬────┘
         │
         ▼
  ┌──────────────┐
  │ Return Data  │
  └──────────────┘
```

## Performance Benefits

1. **Reduced API Calls**: Cache hit rate ~95% setelah warming up
2. **Faster Response**: ~5ms (cache) vs ~500ms (API call)
3. **Cost Savings**: Mengurangi biaya API RajaOngkir
4. **Better UX**: Response time lebih cepat untuk user

## Testing

### Test Cache Hit/Miss

```bash
# First request (Cache MISS)
curl -X POST http://localhost:8686/api/v1/shipping/cost \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "501",
    "destination": "114",
    "weight": 1700,
    "courier": "jne"
  }'

# Second request (Cache HIT)
curl -X POST http://localhost:8686/api/v1/shipping/cost \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "501",
    "destination": "114",
    "weight": 1700,
    "courier": "jne"
  }'
```

Check console logs:

- `❌ Cache MISS - Calling RajaOngkir API`
- `✅ Cache HIT - Returning cached data`

## Notes

- Cache otomatis expired setelah 30 hari
- MongoDB TTL index akan auto-delete expired cache
- Admin bisa manual clear cache jika diperlukan
- Cache key unique per kombinasi origin-destination-weight-courier
