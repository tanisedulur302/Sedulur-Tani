# 🚀 Panduan Deploy Sedulur Tani ke Vercel

## Prasyarat

1. Akun Vercel (https://vercel.com)
2. Repository GitHub sudah di-push
3. Backend sudah di-deploy di Vercel

---

## Langkah 1: Persiapan Repository

Pastikan semua file sudah di-commit dan push ke GitHub:

```bash
cd frontend
git add .
git commit -m "Prepare for Vercel deployment"
git push origin development
```

---

## Langkah 2: Import Project di Vercel

1. Buka https://vercel.com/dashboard
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository **Sedulur-Tani-FE**
4. Vercel akan otomatis mendeteksi framework Next.js

---

## Langkah 3: Konfigurasi Environment Variables

Di halaman konfigurasi Vercel, tambahkan environment variable:

| Name                  | Value                                |
| --------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | `https://sedulur-tani-be.vercel.app` |

**Cara menambahkan:**

1. Scroll ke bagian **"Environment Variables"**
2. Masukkan Name: `NEXT_PUBLIC_API_URL`
3. Masukkan Value: `https://sedulur-tani-be.vercel.app`
4. Pilih environment: ✅ Production, ✅ Preview, ✅ Development
5. Klik **"Add"**

---

## Langkah 4: Konfigurasi Build Settings

Vercel akan otomatis mendeteksi settings, tapi pastikan:

| Setting          | Value                                    |
| ---------------- | ---------------------------------------- |
| Framework Preset | Next.js                                  |
| Root Directory   | `./` (atau kosong jika frontend di root) |
| Build Command    | `npm run build`                          |
| Output Directory | `.next`                                  |
| Install Command  | `npm install`                            |

---

## Langkah 5: Deploy

1. Klik **"Deploy"**
2. Tunggu proses build selesai (biasanya 2-5 menit)
3. Jika sukses, Anda akan mendapat URL seperti:
   - `sedulur-tani-fe.vercel.app`
   - atau custom domain yang Anda set

---

## Langkah 6: Verifikasi Deployment

Setelah deploy selesai:

1. ✅ Buka URL deployment
2. ✅ Test halaman login/register
3. ✅ Test halaman produk
4. ✅ Test fungsi cart (perlu login)
5. ✅ Test admin dashboard (login sebagai seller)

---

## Konfigurasi Custom Domain (Opsional)

1. Buka project di Vercel Dashboard
2. Klik **"Settings"** → **"Domains"**
3. Tambahkan domain Anda
4. Update DNS records sesuai instruksi Vercel

---

## Troubleshooting

### Error: Build Failed

**Penyebab umum:**

- TypeScript error
- Missing dependencies
- Environment variable tidak di-set

**Solusi:**

1. Check build logs di Vercel
2. Run `npm run build` di local untuk test
3. Pastikan semua env vars sudah di-set

### Error: API Not Working

**Penyebab:**

- CORS blocking
- API URL salah
- Backend belum di-deploy

**Solusi:**

1. Pastikan `NEXT_PUBLIC_API_URL` benar
2. Check backend sudah running
3. Pastikan backend CORS allow frontend domain

### Error: Images Not Loading

**Penyebab:**

- Domain tidak ada di next.config.ts

**Solusi:**
Tambahkan domain di `next.config.ts`:

```ts
images: {
  domains: ['your-image-domain.com'],
}
```

### Error: 500 Internal Server Error

**Penyebab:**

- Server-side rendering error
- API timeout

**Solusi:**

1. Check Vercel Function Logs
2. Pastikan API response cepat (< 10 detik)

---

## Environment Variables Reference

| Variable              | Description          | Required |
| --------------------- | -------------------- | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ Yes   |

---

## Post-Deployment Checklist

- [ ] Website bisa diakses
- [ ] Login/Register berfungsi
- [ ] Session management (logout, expired)
- [ ] Produk tampil dengan benar
- [ ] Gambar loading
- [ ] Cart berfungsi
- [ ] Checkout berfungsi
- [ ] Admin dashboard berfungsi
- [ ] Mobile responsive
- [ ] HTTPS aktif

---

## Update Deployment

Setiap push ke branch yang terhubung akan trigger auto-deploy:

```bash
git add .
git commit -m "Update feature"
git push origin development
```

Vercel akan otomatis rebuild dan deploy.

---

## Rollback

Jika ada masalah dengan deployment baru:

1. Buka Vercel Dashboard
2. Klik **"Deployments"**
3. Cari deployment sebelumnya yang working
4. Klik **"..."** → **"Promote to Production"**

---

## Performance Tips

1. **Enable Analytics**: Aktifkan Vercel Analytics untuk monitoring
2. **Edge Functions**: Gunakan untuk API routes yang sering diakses
3. **Image Optimization**: Gunakan next/image untuk semua gambar
4. **ISR**: Gunakan Incremental Static Regeneration untuk halaman produk

---

## Support

Jika ada masalah:

1. Check Vercel Status: https://vercel-status.com
2. Vercel Documentation: https://vercel.com/docs
3. Next.js Documentation: https://nextjs.org/docs

---

**Happy Deploying! 🎉**
