# news_front2

A complete React + Vite frontend for `review_backend`, built in English with a refined editorial UI.

## Included flows

- User login and registration with `username` instead of email
- Animated character login page inspired by the provided reference
- User workspace with personalized recommendations and category news feed
- News detail page with related stories and favorite toggle
- Favorites page
- History page
- Profile editing and password update
- Separate admin login page
- Admin dashboard for:
  - user list
  - news list
  - login streak analytics
  - favorite ranking
  - peak concurrent viewers placeholder endpoint

## Routes

- `/` user login
- `/app/home` user home
- `/app/news/:newsId` news detail
- `/app/favorites` favorites
- `/app/history` history
- `/app/profile` profile
- `/admin` admin login
- `/admin/dashboard` admin dashboard

## Run

```bash
npm install
npm run dev
```

The app runs on `http://127.0.0.1:5174`.

## Build

```bash
npm run build
```

## Backend

Start the FastAPI backend first:

```bash
uvicorn main:app --reload
```

The default Vite proxy points to `http://127.0.0.1:8000`, so local development works without extra CORS changes.

If you deploy the frontend separately, set:

```env
VITE_API_BASE_URL=https://your-api-host
```
