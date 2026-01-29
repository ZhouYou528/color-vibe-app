# Google Authentication Setup

This app uses Google Identity Services for authentication. Follow these steps to set it up:

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production domain
   - Click "Create"
5. Copy the Client ID (it looks like: `xxxxx.apps.googleusercontent.com`)

## 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Google Client ID to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

## 3. Restart Development Server

After adding the environment variable, restart your Next.js development server:
```bash
npm run dev
```

## How It Works

- The app uses Google Identity Services (One Tap and Sign-In button)
- When users click "Sign in with Google", they authenticate with Google
- User information is stored in localStorage (can be upgraded to backend storage)
- Authenticated users can save cards to their library
- Non-authenticated users can still use the app but cannot save cards

## Troubleshooting

- **Button not showing**: Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- **Authentication fails**: Check that your domain is added to authorized origins in Google Cloud Console
- **CORS errors**: Ensure your production domain matches exactly what's configured in Google Cloud Console
