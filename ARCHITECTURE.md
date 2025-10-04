# 🏗️ FIRE FIT ARCHITECTURE DOCUMENTATION

## Overview

Fire Fit uses a **hybrid architecture** with multiple fallback layers to ensure the app works in various environments (production, development, demo, offline).

## 📊 Architecture Layers

### Layer 1: Frontend React App
```
src/services/outfitAPI.js
    ↓
Wrapper functions that handle all API logic
```

### Layer 2: Supabase Edge Functions (Optional)
```
supabase/functions/
    ├── analyze-fit/index.js     → AI analysis endpoint
    ├── save-fit/index.js         → Save outfit endpoint
    ├── getSavedFits/index.js     → Fetch outfits endpoint
    └── upload-file/index.js      → File upload endpoint
```

### Layer 3: Direct Supabase Client
```
Fallback to direct database/storage operations
when Edge Functions are unavailable
```

### Layer 4: LocalStorage Fallback
```
Local-only mode for offline/demo scenarios
```

## 🔄 Data Flow

### Upload Flow
```
User selects file
    ↓
UploadFitPage.jsx
    ↓
outfitAPI.uploadFile()
    ↓
[Option A] supabase/functions/upload-file (if deployed)
[Option B] Direct Supabase Storage API ✓ (current)
    ↓
Returns public URL
```

### Analysis Flow
```
User clicks "Analyze"
    ↓
outfitAPI.analyzeFit(payload)
    ↓
[Option A] supabase/functions/analyze-fit
    ↓ (if available)
    Google AI Studio API
    ↓
[Option B] Mock AI Generator ✓ (fallback)
    ↓
Returns analysis JSON
    ↓
FitDisplay.jsx renders results
```

### Save Flow
```
User clicks "Save to Favorites"
    ↓
outfitAPI.saveFit(payload)
    ↓
[Option A] supabase/functions/save-fit (if deployed)
[Option B] Direct Supabase DB insert ✓ (fallback)
[Option C] LocalStorage (offline fallback)
    ↓
Returns saved outfit record
    ↓
Success notification
```

### Fetch Flow
```
FavoritesPage loads
    ↓
outfitAPI.getSavedFits(sessionId)
    ↓
[Option A] supabase/functions/getSavedFits (if deployed)
[Option B] Direct Supabase DB query ✓ (fallback)
[Option C] LocalStorage (offline fallback)
    ↓
Returns outfit array
    ↓
FavoritesPage renders grid
```

## 🎯 Why This Architecture?

### 1. **Resilience**
Multiple fallback layers ensure the app works even when:
- Edge Functions aren't deployed
- Supabase is down
- User is offline
- In demo/development mode

### 2. **Flexibility**
Easy to switch between:
- Production (with all Edge Functions)
- Development (direct DB access)
- Demo (mock AI)
- Offline (localStorage)

### 3. **Scalability**
Edge Functions allow:
- Server-side AI processing
- Image optimization
- Rate limiting
- Complex business logic
- Without bloating frontend bundle

## 📝 Important Notes

### Edge Functions vs Direct Access

**Edge Functions** (`supabase/functions/`) are **NOT** imported as modules. They are:
- Deployed to Supabase cloud
- Called via HTTP using `supabase.functions.invoke()`
- Run on Deno runtime
- Have access to environment variables
- Can use service role key for privileged operations

**Direct Access** (`src/services/outfitAPI.js`) uses:
- `@supabase/supabase-js` client library
- Runs in browser
- Uses anon key (limited permissions)
- Good for simple CRUD operations

### Current Implementation

✅ **Currently using:**
- Direct Supabase Storage for uploads
- Edge Function for analysis (with mock fallback)
- Direct DB insert for saves (with Edge Function attempt first)
- Direct DB query for fetches (with Edge Function attempt first)

### When to Deploy Edge Functions

Deploy Edge Functions when you need:
- ✅ Real Google AI Studio integration
- ✅ Image preprocessing/optimization
- ✅ Complex server-side logic
- ✅ Rate limiting
- ✅ Webhook handling
- ✅ External API calls

Can skip Edge Functions for:
- ✅ Simple CRUD operations
- ✅ Demo/development mode
- ✅ MVP testing

## 🚀 Deployment Options

### Option 1: Full Stack (Recommended for Production)
```bash
# Deploy all Edge Functions
supabase functions deploy analyze-fit
supabase functions deploy save-fit
supabase functions deploy getSavedFits
supabase functions deploy upload-file
```

### Option 2: Hybrid (Current Setup)
```bash
# Deploy only AI analysis
supabase functions deploy analyze-fit
# Use direct DB access for everything else
```

### Option 3: Client-Only (Demo Mode)
```bash
# Don't deploy any Edge Functions
# App uses direct access + mock AI
```

## 🔐 Security Considerations

### Row Level Security (RLS)
Enable RLS on Supabase tables for production:

```sql
-- Enable RLS
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo
CREATE POLICY "Enable all operations for demo"
ON outfits FOR ALL
TO public
USING (true)
WITH CHECK (true);
```

### Storage Policies
```sql
-- Allow public uploads to outfit-images
CREATE POLICY "Enable uploads for demo"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'outfit-images');

-- Allow public reads
CREATE POLICY "Enable public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'outfit-images');
```

## 📚 Function Reference

### `src/services/outfitAPI.js`

All functions follow this pattern:
1. Try Edge Function (if deployed)
2. Fall back to direct operation
3. Fall back to localStorage (if applicable)

### Imports
```javascript
import { supabase } from '../lib/client'
import { generateMockAnalysis, simulateDelay } from '../utils/mockAI'
```

### Error Handling
Each function includes:
- Try-catch blocks
- Console logging for debugging
- Graceful fallbacks
- Meaningful error messages

## 🎨 UI/UX Flow

1. **Demo Banner** - Shows session info
2. **Navigation** - Switch between Upload/Favorites
3. **Upload Page** - 5 image slots + context selectors
4. **Analysis** - Loading → AI results → FitDisplay
5. **Save** - Confirmation → Favorites page updates
6. **Favorites** - Grid view → Detail modal

## ✅ Summary

The Fire Fit architecture prioritizes:
- **Reliability** through multiple fallbacks
- **Flexibility** for different deployment scenarios  
- **Developer Experience** with clear abstractions
- **User Experience** with graceful degradation

This design allows the app to work perfectly in:
- ✅ Production with full backend
- ✅ Development with partial backend
- ✅ Demo mode with mock data
- ✅ Offline with localStorage

---

**Questions?** Check the main README.md or review the inline comments in the code!
