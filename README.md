# 🔥 FIRE FIT - AI-Powered Outfit Analyzer & Recommender

**MVP Demo Version** - No authentication required

An AI-assisted outfit analyzer and recommendation system built with React, Supabase, and Google AI Studio (Gemini Vision API).

## 🎯 Features

- **Upload Outfit Pieces**: Upload images for Top, Top Layer (jacket/coat), Bottom, Shoes, and Accessories
- **AI Analysis**: Get AI-powered style analysis including aesthetics, color palette, and recommendations
- **Seasonal Context**: Select season and formality level for context-aware suggestions
- **Save Favorites**: Save your favorite outfits to review later
- **Mock AI Fallback**: Works with mock AI when backend is unavailable
- **Demo Mode**: No login required - perfect for demonstrations

## 🏗️ Architecture

### Frontend
- **React 19** + **Vite** for fast development
- **Custom CSS** with CSS variables for theming
- Modular component structure
- LocalStorage fallback for offline functionality

### Backend
- **Supabase** for database, storage, and Edge Functions
- **Google AI Studio** (Gemini Vision API) for image analysis
- Mock AI layer for development/demo mode

### Data Flow
```
Upload → Supabase Storage → Edge Function → AI Analysis → Display → Save to DB
```

## 📁 Project Structure

```
src/
├── components/
│   ├── FavoritesPage.jsx      # Saved outfits display
│   └── FitDisplay.jsx          # AI analysis results display
├── hooks/
│   └── useDemoSession.js       # Session management hook
├── lib/
│   ├── client.js               # Supabase client setup
│   └── storage.js              # Storage utilities
├── pages/
│   └── UploadFitPage.jsx       # Main upload interface
├── services/
│   └── outfitAPI.js            # API wrapper functions
├── styles/
│   ├── FavoritesPage.css
│   ├── FitDisplay.css
│   └── UploadFitPage.css
├── utils/
│   ├── mockAI.js               # Mock AI responses
│   └── seasonPresets.js        # Seasonal context presets
├── App.jsx                     # Main app component
└── main.jsx                    # Entry point

supabase/
└── functions/
    ├── analyze-fit/            # AI analysis Edge Function
    ├── save-fit/               # Save outfit Edge Function
    ├── getSavedFits/           # Fetch outfits Edge Function
    └── upload-file/            # File upload Edge Function
```

## 🗄️ Database Schema

### `demo_sessions` Table
```sql
CREATE TABLE demo_sessions (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB
);
```

### `outfits` Table
```sql
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  top_url TEXT,
  top_layer_url TEXT,
  bottom_url TEXT,
  shoes_url TEXT,
  accessories_url TEXT,
  ai_description TEXT,
  ai_image_url TEXT,
  season TEXT,
  formality TEXT,
  aesthetic TEXT[],
  colors JSONB,
  accessories_description TEXT,
  accessories_tags TEXT[],
  saved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Storage Bucket: `outfit-images`
```
outfit-images/
└── {session_id}/
    └── originals/
        ├── top_{timestamp}_{filename}
        ├── topLayer_{timestamp}_{filename}
        ├── bottom_{timestamp}_{filename}
        ├── shoes_{timestamp}_{filename}
        └── accessories_{timestamp}_{filename}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Google AI Studio API key (optional for full AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DavidRaet/fire-fit-demo.git
   cd fire-fit-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   - Create a new Supabase project
   - Run the SQL from `Database Schema` section above
   - Create a storage bucket named `outfit-images` (public)
   - Deploy Edge Functions (optional):
     ```bash
     supabase functions deploy analyze-fit
     supabase functions deploy save-fit
     supabase functions deploy getSavedFits
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🎨 Key Components

### `UploadFitPage.jsx`
Main upload interface with:
- 5 image upload slots (Top, Top Layer, Bottom, Shoes, Accessories)
- Season and Formality selectors
- Image preview and remove functionality
- Analyze and Clear buttons

### `FitDisplay.jsx`
Displays AI analysis results:
- Generated outfit preview image
- Image thumbnails for each piece
- AI description and insights
- Aesthetic tags and color palette
- Save and Reroll buttons

### `FavoritesPage.jsx`
Shows saved outfits:
- Grid layout of saved outfits
- Detail modal with full information
- Delete functionality

## 🔌 API Functions

The app uses wrapper functions in `src/services/outfitAPI.js`:

### `uploadFile(file, category, sessionId)`
Uploads image to Supabase Storage

### `analyzeFit(payload)`
Calls Edge Function or mock AI to analyze outfit
- **Edge Function**: `supabase/functions/analyze-fit/index.js`
- **Fallback**: Mock AI generator

### `saveFit(payload)`
Saves outfit to database
- **Edge Function**: `supabase/functions/save-fit/index.js`
- **Fallback**: Direct DB insert or localStorage

### `getSavedFits(sessionId)`
Retrieves saved outfits
- **Edge Function**: `supabase/functions/getSavedFits/index.js`
- **Fallback**: Direct DB query or localStorage

## 🧪 Mock AI Mode

The app includes a sophisticated mock AI system that:
- Generates realistic outfit descriptions based on season and formality
- Suggests appropriate accessories
- Creates aesthetic tags and color palettes
- Works offline without backend

Perfect for demos and development!

## 🎯 Future Enhancements

- [ ] Full Google AI Studio integration for real image analysis
- [ ] Nanobanana integration for outfit image generation
- [ ] User authentication system
- [ ] Social sharing features
- [ ] Outfit recommendations based on weather API
- [ ] Style trends analysis
- [ ] Virtual try-on features

## 🔧 Configuration

### Seasonal Presets
Edit `src/utils/seasonPresets.js` to customize:
- Recommended colors per season
- Suggested accessories
- Aesthetic tags

### Formality Levels
Modify `FORMALITY_LEVELS` in `seasonPresets.js`:
- Casual
- Semi-formal
- Business-casual
- Sports/Active

## 📝 Notes

- **Demo Mode**: The app runs in demo mode by default with no authentication
- **Session Management**: Sessions are stored in localStorage and optionally synced to Supabase
- **Fallback Logic**: Multiple fallback layers ensure the app works even without backend
- **Edge Functions**: Optional but recommended for production deployment

## 🤝 Contributing

This is a demo/MVP project. For production use:
1. Implement proper authentication
2. Add error boundaries
3. Implement rate limiting
4. Add image optimization
5. Enable real AI integration

## 📄 License

MIT License - feel free to use for your own projects!

## 🙏 Acknowledgments

- React Team
- Supabase Team
- Google AI Studio (Gemini)
- Design inspiration from modern fashion apps

---

Built with 🔥 by the Fire Fit Team
