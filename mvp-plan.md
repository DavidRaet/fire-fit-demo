# 🧩 FIRE FIT — MVP SYSTEM ARCHITECTURE

**Version:** MVP-1  
**Frontend:** React  
**Backend:** Supabase  
**AI Layer:** Google AI Studio + Nanobanana  
**Purpose:** AI-assisted outfit analyzer and recommender demo without user auth  

---

## 🔥 1. HIGH-LEVEL OVERVIEW
[React Frontend]
| ↑
| | (Upload, Display, Save)
v |
[Supabase Backend + Storage]
| ↑
| | (Process requests, persist outfits)
v |
[Google AI Studio / Nanobanana]
| ↑
| | (Generate style descriptions or new outfit images)
v |
[Mock Weather Context]




- **Frontend (React)** → Collects images, handles user flow, and displays results.
- **Supabase (Backend)** → Manages storage, triggers AI analysis, and stores outfit data.
- **Google AI Studio / Nanobanana** → Analyzes or generates outfit data.
- **Weather Context** → Mock presets for seasonal/formality tiers.

---

## ⚙️ 2. CORE COMPONENTS

### **Frontend (React)**
| Component | Description |
|------------|-------------|
| `UploadFitPage` | Handles uploading/cropping of top, bottom, and shoes. |
| `FitAnalyzer` | Sends uploaded images to backend → AI analysis. |
| `FitGenerator` | Displays AI-generated outfit suggestions (text or image). |
| `FavoritesPage` | Lists saved outfits for the demo session. |
| `FitContext` | Tracks current mock season + formality tier. |
| `DemoBanner` | Indicates “Demo Mode – No Login Required”. |

**LocalStorage Use:** temporarily stores user interactions before persisting to Supabase (so demo feels responsive).

---

### **Backend (Supabase)**
| Function | Description |
|-----------|--------------|
| `/analyzeFit` | Uploads images → calls Google AI Studio → returns labeled clothing items and aesthetics. |
| `/generateFit` | (Optional Nanobanana call) Generates a new outfit suggestion image. |
| `/saveOutfit` | Persists analyzed outfit and metadata to database. |
| `/getOutfits` | Fetches all outfits associated with the demo session. |

---

### **AI Services (Google AI Studio + Nanobanana)**

| Service | Purpose | Example Use |
|----------|----------|--------------|
| **Google AI Studio (Gemini Vision API)** | Analyze uploaded images, identify clothing items (e.g. “white crop top”, “denim jeans”). | Input: user-uploaded outfit photos. Output: structured text JSON. |
| **Nanobanana** | Generate a new outfit or suggestion image. | Input: clothing description + formality + season. Output: generated outfit image. |
| **Mock Weather Presets** | Determine style context. | Example: `{ season: "Fall", temperature: 65°F, formality: "Casual" }`. |

---

## 🗄️ 3. DATABASE SCHEMA (SUPABASE)

### **Table: demo_sessions**
| Field | Type | Description |
|--------|------|-------------|
| id | uuid | Unique session ID. |
| started_at | timestamp | Session start time. |
| preferences | jsonb | { "season": "Fall", "formality": "Casual" } |

### **Table: outfits**
| Field | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key. |
| session_id | uuid | FK → demo_sessions.id |
| top_url | text | Link to uploaded top image. |
| bottom_url | text | Link to uploaded bottom image. |
| shoes_url | text | Link to uploaded shoes image. |
| ai_description | text | Output from Google AI Studio. |
| ai_image_url | text | Optional generated image. |
| season | text | From mock presets. |
| formality | text | Selected tier. |
| saved | boolean | Indicates if user saved it. |
| created_at | timestamp | Timestamp. |

### **Table: favorites**
| Field | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| outfit_id | uuid | FK → outfits.id |
| session_id | uuid | FK → demo_sessions.id |
| notes | text | Optional notes (e.g. "liked colors"). |

---

## 🔩 4. DATA FLOW — DEMO VERSION
(1) User uploads images
↓
React (UploadFitPage)
↓
Stores image → Supabase Storage
↓
Supabase Function /analyzeFit
↓
Google AI Studio → identifies clothing pieces
↓
Returns JSON description → Supabase → React
↓
React displays AI description + outfit image (if any)
↓
User clicks “Save Outfit”
↓
React calls /saveOutfit → Supabase persists data
↓
FavoritesPage retrieves and displays all saved outfits


🧠 5. MOCK WEATHER & FORMALITY PRESETS
| Season | Description         | Example Context                    |
| ------ | ------------------- | ---------------------------------- |
| Spring | Light, pastel tones | “floral, airy, layered”            |
| Summer | Bright, breathable  | “crop tops, shorts, slides”        |
| Fall   | Earthy, layered     | “denim, long sleeves, boots”       |
| Winter | Warm, muted         | “jackets, sweaters, thermal tones” |



| Formality       | Example Outfits     |
| --------------- | ------------------- |
| Casual          | Jeans + sneakers    |
| Semi-formal     | Skirts + blouses    |
| Business-casual | Slacks + button-ups |
| Sports          | Activewear          |


