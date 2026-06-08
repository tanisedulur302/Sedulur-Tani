# Sitemap

## User Sitemap

```mermaid
graph TD
  A["/ (Beranda)"] --> B["/dashboard"]
  A --> C["/products"]
  C --> D["/products/[id]"]
  A --> E["/categories"]
  A --> F["/cart"]
  F --> G["/checkout"]
  G --> H["/payment/success"]
  A --> I["/orders"]
  I --> J["/orders/[id]"]
  I --> K["/orders/success"]
  A --> L["/profile"]
  A --> M["/login"]
  A --> N["/register"]
  C --> F
  D --> F
  G --> I
```

## Admin Sitemap

```mermaid
graph TD
  A["/admin"] --> B["/admin/dashboard"]
  A --> C["/admin/products"]
  A --> D["/admin/categories"]
  A --> E["/admin/orders"]
  A --> F["/admin/users"]
  A --> G["/admin/reports"]
  A --> H["/admin/settings"]
```

## Catatan

- Route user dan admin diambil dari struktur `frontend/app`.
- Beberapa halaman bersifat protected, jadi aksesnya bergantung pada status login dan role user.
- Jika dibutuhkan, sitemap ini bisa saya pecah lagi menjadi versi visual yang lebih detail per flow, misalnya alur belanja, alur pembayaran, atau alur admin.
