# Authentication Testing Guide

## Quick Test Steps

### 1. Start the Development Server
```bash
cd apps/exchange
npm run dev
```

### 2. Open the Application
Navigate to: http://localhost:3000

### 3. Register a New Account

1. Click the **"Sign In"** button in the top-right header
2. Click the **"Register"** tab in the modal
3. Fill in the registration form:
   - **Email**: your-email@example.com
   - **Username**: yourname
   - **Password**: at least 8 characters
4. Click **"Create Account"**
5. If successful, you'll be automatically logged in

### 4. Test Login

1. If you logout, click **"Sign In"** again
2. Use the **"Login"** tab
3. Enter your email and password
4. Click **"Login"**

### 5. Verify Authentication

Once logged in, you should see:
- ✅ Your username in the top-right corner
- ✅ Your available balance displayed
- ✅ User menu dropdown (click your username)
- ✅ Trading panel allows order placement

### 6. Test Trading (Authenticated Required)

1. Select a trading pair (BTC, ETH, SOL)
2. Choose order type (Limit or Market)
3. Enter amount
4. Click percentage buttons (25%, 50%, 75%, 100%)
5. Click Buy or Sell button
6. Check for success/error messages

## Expected Behavior

### When NOT Authenticated:
- ❌ Balance shows $0.00
- ❌ Trading panel shows "Please login to trade"
- ❌ Orders won't execute
- ✅ Charts still work (public data)
- ✅ Market data still visible

### When Authenticated:
- ✅ Real balance shown
- ✅ Can place orders
- ✅ Can view positions
- ✅ Can see order history
- ✅ Can logout

## Common Issues & Solutions

### Issue: Can't click Sign In button
**Solution**: Check if the Header component is rendering. Reload the page.

### Issue: 403 Errors on API Calls
**Solution**: This is normal when not logged in. Balance and trading endpoints require authentication.

### Issue: Registration fails
**Possible causes**:
- Email already exists
- Password too short (min 8 characters)
- Username too short (min 3 characters)
- API server is down

**Solution**: Check browser console for error details

### Issue: Login fails
**Possible causes**:
- Wrong email/password
- Account doesn't exist
- API server is down

**Solution**: Try registering a new account first

### Issue: Orders not placing
**Possible causes**:
- Not authenticated
- Insufficient balance
- Invalid amount/price
- Market not available

**Solution**: Check error message displayed below the form

## API Endpoints Being Used

### Public (No Auth Required)
- ✅ `GET /api/v1/market/meta` - Market list
- ✅ `GET /api/v1/market/price/{coin}` - Price data
- ✅ `GET /api/v1/market/orderbook/{coin}` - Order book
- ✅ `GET /api/v1/market/candles/{coin}` - Chart data

### Protected (Auth Required)
- 🔒 `POST /api/v1/auth/register` - Register
- 🔒 `POST /api/v1/auth/login` - Login
- 🔒 `GET /api/v1/users/balance` - Balance
- 🔒 `POST /api/v1/trading/order` - Place order
- 🔒 `GET /api/v1/trading/positions` - Positions
- 🔒 `GET /api/v1/trading/orders` - Open orders

## Testing API Directly

### Register via curl:
```bash
curl -X POST https://exchange-api.chipatrade.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login via curl:
```bash
curl -X POST https://exchange-api.chipatrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Balance with Token:
```bash
curl -X GET https://exchange-api.chipatrade.com/api/v1/users/balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Browser Console Debugging

Open browser DevTools (F12) and check:

1. **Console tab** - Look for:
   - API errors (red text)
   - Authentication status
   - datafeed logs

2. **Network tab** - Monitor:
   - API requests
   - Response status codes (200 = OK, 403 = Not Authenticated)
   - Response data

3. **Application tab** - Check:
   - localStorage → `access_token` (should exist when logged in)
   - localStorage → `refresh_token` (should exist when logged in)

## Success Indicators

✅ No 403 errors after login
✅ Balance shows real value
✅ User menu displays username
✅ Orders can be placed
✅ Success messages appear

---

**Need Help?**
Check `API_INTEGRATION.md` for full documentation
