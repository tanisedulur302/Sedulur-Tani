# Testing Guide - Session Expiry Implementation

## Quick Test Checklist

### ✅ Test 1: Token Expiry Detection

**Goal**: Verify token expiry check works correctly

```bash
# Steps:
1. Login ke aplikasi
2. Open DevTools (F12)
3. Pergi ke Console tab
4. Salin dan jalankan:

localStorage.removeItem('token');
window.dispatchEvent(new Event('auth-changed'));

# Expected: Redirect ke /login dalam 1 detik
```

---

### ✅ Test 2: Invalid Token Cleanup

**Goal**: Verify invalid/corrupted token is cleaned up

```bash
# Steps:
1. Open DevTools Console
2. Jalankan:

localStorage.setItem('token', 'invalid-token-xyz');
localStorage.setItem('user', JSON.stringify({id: '1', name: 'Test', role: 'buyer'}));
window.location.reload();

# Expected: Redirect ke /login karena token invalid
```

---

### ✅ Test 3: Check Token Remaining Time

**Goal**: See how much time is left before token expires

```bash
# Steps:
1. Login ke aplikasi
2. Open DevTools Console
3. Jalankan:

import { getTokenRemainingTime } from '@/lib/utils/auth';
const token = localStorage.getItem('token');
const remaining = getTokenRemainingTime(token);
console.log('Token expires in:', Math.floor(remaining / 60), 'minutes');
console.log('Token expires in:', Math.floor(remaining / 3600), 'hours');

# Expected: Shows remaining time (contoh: 6 hari, 23 jam)
```

---

### ✅ Test 4: Manual Token Expiry Simulation

**Goal**: Test by manually setting token to expired

```bash
# Steps:
1. Login ke aplikasi
2. Open DevTools Console
3. Jalankan untuk create fake token yang sudah expired:

const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
const now = Math.floor(Date.now() / 1000);
const payload = btoa(JSON.stringify({
  id: '1',
  email: 'test@test.com',
  role: 'buyer',
  iat: now - 1000,
  exp: now - 100  // Expired 100 detik yang lalu
}));
const signature = 'fake-signature';
const fakeExpiredToken = header + '.' + payload + '.' + signature;
localStorage.setItem('token', fakeExpiredToken);
window.location.reload();

# Expected: Redirect ke /login karena token sudah expired
```

---

### ✅ Test 5: API Error 401 Handling

**Goal**: Test redirect when API returns 401 Unauthorized

```bash
# Prerequisites:
- Ensure token sudah expired atau invalid

# Steps:
1. Login dengan token yang valid
2. Manually set invalid token:
localStorage.setItem('token', 'invalid-token');

3. Buat API call (contoh: add to cart):
- Go to products page
- Click tombol "Add to Cart"
- Monitor network tab

# Expected:
- API returns 401
- Token dihapus dari localStorage
- Redirect ke /login
```

---

### ✅ Test 6: Multiple Tabs Synchronization

**Goal**: Test logout in one tab affects other tabs

```bash
# Steps:
1. Login ke aplikasi di Tab A
2. Buka tab yang sama (Tab B) - akan sharing localStorage
3. Di Tab A, buka DevTools Console
4. Jalankan logout:

localStorage.removeItem('token');
localStorage.removeItem('user');
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new Event('auth-changed'));

# Expected:
- Tab B akan terdeteksi logout
- Tab B akan redirect ke /login dalam ~1 detik
```

---

### ✅ Test 7: Admin Session Expiry

**Goal**: Test admin/seller can't access after session expired

```bash
# Steps:
1. Login sebagai seller/admin
2. Access /admin dashboard
3. Open DevTools Console
4. Jalankan:

localStorage.removeItem('token');
window.dispatchEvent(new Event('auth-changed'));

# Expected:
- Admin layout detects expired session
- Redirect ke /login
- Show "Unauthorized" or loading spinner briefly
```

---

### ✅ Test 8: Protected Route Access

**Goal**: Test user can't access protected routes without valid token

```bash
# Steps:
1. Clear localStorage:
localStorage.clear();

2. Try direct access ke protected routes:
- /profile
- /orders
- /checkout
- /admin/dashboard

# Expected: Redirect ke /login
```

---

### ✅ Test 9: Login/Register Page Access

**Goal**: Test login/register pages work even with expired token

```bash
# Steps:
1. Set expired token:
localStorage.setItem('token', 'expired-token');
localStorage.setItem('user', JSON.stringify({id: '1', role: 'buyer'}));

2. Try access /login atau /register

# Expected:
- Pages load normally
- No redirect loop
- Can fill and submit form
```

---

### ✅ Test 10: Token Validation at App Startup

**Goal**: Test app validates token immediately when loaded

```bash
# Steps:
1. Simulate expired token in localStorage:

const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
const now = Math.floor(Date.now() / 1000);
const payload = btoa(JSON.stringify({
  id: '1', email: 'test@test.com', role: 'buyer',
  iat: now - 1000, exp: now - 100
}));
localStorage.setItem('token', header + '.' + payload + '.sig');
localStorage.setItem('user', JSON.stringify({id: '1', role: 'buyer'}));

2. Close tab dan refresh

# Expected:
- App loads
- Detects expired token dalam 1-2 detik
- Redirect ke /login
```

---

## Integration Tests

### Test Flow 1: Complete Login to Logout Journey

```
1. Clear all data: localStorage.clear()
2. Go to /login
3. Fill login form
4. Submit → Should redirect ke home atau admin
5. Check localStorage has token and user
6. Go to protected page (contoh: /profile)
7. Trigger logout → Redirect ke /login
8. Try refresh page → Stay di /login
```

### Test Flow 2: Session Timeout Simulation

```
1. Login
2. Simulate passage of time by modifying localStorage token expiry
3. Make API call → Should trigger 401
4. App should redirect ke /login
```

### Test Flow 3: Token Expiry During Activity

```
1. Login
2. Modify token to be expired
3. While on page, click button yang trigger API
4. Interceptor should catch expired token
5. Redirect ke /login
```

---

## Browser DevTools Debugging

### Check Token Status

```js
// Console command to check all auth-related data
(() => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.group("🔐 Auth Status");

  if (token) {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - now;

      console.log("✅ Token Found");
      console.log("Payload:", payload);
      console.log("Expires in:", Math.floor(remaining / 60), "minutes");
      console.log("Is Expired:", remaining <= 0);
    }
  } else {
    console.log("❌ No token found");
  }

  if (user) {
    console.log("✅ User:", JSON.parse(user));
  } else {
    console.log("❌ No user data");
  }

  console.groupEnd();
})();
```

### Monitor Auth Events

```js
// Console command to listen to auth changes
window.addEventListener("auth-changed", () => {
  console.log("🔄 Auth changed event fired", new Date());
});

window.addEventListener("storage", (e) => {
  console.log("💾 Storage changed:", e.key, e.newValue);
});
```

---

## Common Issues & Solutions

### Issue: User tidak di-redirect meskipun token expired

**Check:**

1. Token benar-benar sudah expired: `isTokenExpired(localStorage.getItem('token'))`
2. AuthSessionProvider di-mount: Check console untuk errors
3. Network tab: Lihat apakah ada XHR errors

**Solution:**

1. Manual redirect: `window.location.href = '/login'`
2. Clear cache: `localStorage.clear()` dan refresh
3. Check browser console untuk error messages

### Issue: Redirect loop antara /login dan home

**Check:**

1. Login page harus exclude dari auth check
2. Valid token harus preserve user di home

**Solution:**

1. Check AuthSessionProvider exclude routes
2. Ensure ClientLayout tidak double-wrap

### Issue: Multiple API calls saat token expired

**Check:**

1. Request interceptor check token sebelum request
2. Response interceptor handle 401 properly

**Solution:**

1. Wrap API calls dengan try-catch
2. Check network tab untuk status codes
3. Verify token di localStorage

---

## Performance Testing

### Measure Token Check Time

```js
console.time("Token Check");
const token = localStorage.getItem("token");
const isExpired = isTokenExpired(token);
console.timeEnd("Token Check");

// Expected: < 1ms
```

### Measure Redirect Time

```js
// Mark waktu sebelum redirect
performance.mark("redirect-start");

// Trigger redirect
localStorage.removeItem("token");
window.dispatchEvent(new Event("auth-changed"));

// Measure
setTimeout(() => {
  const entries = performance.getEntriesByName("redirect-start");
  console.log("Redirect triggered");
}, 100);
```

---

## Regression Testing Checklist

After any changes to auth system:

- [ ] Login page loads and works
- [ ] Register page loads and works
- [ ] Valid token allows access to protected pages
- [ ] Expired token redirects to login
- [ ] API 401 error triggers logout
- [ ] Admin routes require seller/admin role
- [ ] Multiple tabs stay in sync
- [ ] Token decoding works for all JWT formats
- [ ] No console errors or warnings
- [ ] Performance remains acceptable

---

## Expected Behaviors Summary

| Scenario                 | Expected Behavior                        |
| ------------------------ | ---------------------------------------- |
| App load + valid token   | Show page content                        |
| App load + expired token | Redirect to /login                       |
| App load + no token      | Redirect to /login (if protected route)  |
| API call + 401 error     | Redirect to /login                       |
| API call + 403 error     | Redirect to home/admin based on role     |
| Logout                   | Clear storage, redirect to /login        |
| Multiple tabs logout     | All tabs redirect to /login              |
| Token about to expire    | Current behavior: force logout at expiry |
| Admin access + expired   | Force logout, redirect to /login         |

---

## Post-Implementation Verification

After deploying, verify:

1. ✅ Production app properly validates tokens
2. ✅ No sensitive data in localStorage
3. ✅ No console errors in production
4. ✅ Redirects work correctly
5. ✅ Performance metrics acceptable
6. ✅ Security headers proper
7. ✅ No CORS issues with auth
8. ✅ Mobile app handles session properly
