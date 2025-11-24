# Google Cloud Translation API Setup Guide

## Quick Setup (5 minutes)

### 1. Get Google Cloud API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Translation API**
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy the API key

### 2. Add API Key to Project
```bash
# In the frontend directory
cd frontend
cp .env.example .env
```

Edit `.env` and replace with your actual API key:
```
VITE_GOOGLE_TRANSLATION_API_KEY=your_actual_api_key_here
```

### 3. Restart Development Server
```bash
# Stop current server (Ctrl+C) and restart
npm run dev
```

## Features

✅ **Automatic Language Detection** - Detects English/Spanish automatically  
✅ **High-Quality Translations** - Uses Google's neural translation  
✅ **Fallback Support** - Works even without API key using basic translations  
✅ **Error Handling** - Graceful fallback if API fails  
✅ **Cost Control** - Only translates when you click the translate button  

## Usage

1. Enter question in English or Spanish
2. Click the 🌐 translate button
3. System detects language and translates to the other language
4. Review both versions before saving

## API Costs

Google Translation API costs:
- **$20 per 1M characters** (most generous tier)
- **Free tier**: 500K characters/month
- Your quiz questions will use minimal characters

For a church app with ~100 questions, you'll use ~10K characters total = ~$0.20

## Security Notes

- API key is stored in environment variables (not in code)
- For production, consider moving translation to backend
- API key should be restricted to your domain in Google Console

## Troubleshooting

**Translation not working?**
- Check that API key is correctly set in `.env`
- Verify Cloud Translation API is enabled
- Check browser console for error messages

**Still using basic translations?**
- API key might be missing or invalid
- Check console warning: "Google Translation API key not found"

## Production Deployment

For Encore deployment, add the environment variable:
```bash
# Set in Encore dashboard or deployment settings
VITE_GOOGLE_TRANSLATION_API_KEY=your_production_api_key
```
