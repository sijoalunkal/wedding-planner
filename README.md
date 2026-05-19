# 💍 Nikah Planner — Wedding Organizer

A full-stack wedding planning web app with real-time database sync.  
Built with **React + Vite** on the frontend and **Supabase** (PostgreSQL) as the backend.

---

## ✨ Features

- **Events** — Add wedding, engagement, mehendi, mayun, valima events with date, time, venue
- **Guests** — Track individuals and family groups, RSVP status (confirmed / pending / declined)
- **Expenses** — Full budget tracker with categories, paid/unpaid status, per-event breakdown
- **Dashboard** — Live countdown, stats, and summaries all in one place
- **Database sync** — Everything saves to Supabase, accessible from any device

---

## 🚀 How to Host (Step by Step)

### Step 1 — Set up Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **"New Project"** → give it a name (e.g. "nikah-planner") → set a password → Create
3. Wait ~1 minute for it to provision
4. Go to **SQL Editor** (left sidebar) → click **"New Query"**
5. Copy the entire contents of `supabase_schema.sql` and paste it → click **Run**
6. Go to **Project Settings → API**
   - Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy your **anon public** key

---

### Step 2 — Set up the Project Locally

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

```bash
# Run locally to test
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the app!

---

### Step 3 — Deploy to Vercel (Free Hosting)

1. Push your code to **GitHub** (create a free repo at github.com)
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/nikah-planner.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
3. Click **"New Project"** → Import your GitHub repo
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy** — done! You'll get a live URL like `https://nikah-planner.vercel.app`

---

### Alternative: Deploy to Netlify

1. Run `npm run build` — this creates a `dist/` folder
2. Go to [netlify.com](https://netlify.com) → drag and drop the `dist/` folder
3. Go to **Site Settings → Environment Variables** and add the same two variables
4. **Redeploy** the site

---

## 📁 Project Structure

```
wedding-app/
├── src/
│   ├── lib/
│   │   ├── supabase.js      # Supabase client + DB helpers
│   │   ├── data.jsx         # Global state context (syncs with DB)
│   │   └── toast.jsx        # Notification system
│   ├── components/
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── Modal.jsx        # Reusable modal
│   ├── pages/
│   │   ├── Dashboard.jsx    # Home overview
│   │   ├── Events.jsx       # Event management
│   │   ├── Guests.jsx       # Guest list
│   │   └── Expenses.jsx     # Expense tracker
│   ├── App.jsx              # Router + layout
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── supabase_schema.sql      # Run this in Supabase SQL Editor
├── .env.example             # Template for environment variables
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔐 Adding Login (Optional Future Step)

Supabase has built-in auth. To restrict access to only you and your family:
1. Enable **Email Auth** in Supabase → Authentication → Providers
2. Update the RLS policies in `supabase_schema.sql` to use `auth.uid()`
3. Add a login screen to the React app

---

## 💡 Tech Stack

| Layer | Tech | Cost |
|-------|------|------|
| Frontend | React 18 + Vite | Free |
| Database | Supabase (PostgreSQL) | Free tier (500MB) |
| Hosting | Vercel or Netlify | Free tier |
| Fonts | Google Fonts | Free |

**Total cost to run: ₨0 / month** on free tiers.
