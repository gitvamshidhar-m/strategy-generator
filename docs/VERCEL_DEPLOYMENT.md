# Deployment Configuration for Vercel

## Environment Variables

Create a `.env.local` file in your project root with the following:

```env
# Groq API Configuration (required for AI strategy generation)
GROQ_API_KEY=your-groq-api-key-here
GROQ_API_URL=https://api.groq.com/v1

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=AI Growth Strategy Generator
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

## Vercel Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": ".next"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/.next/server/pages/$1"
    }
  ],
  "env": {
    "GROQ_API_KEY": "@groq_api_key"
  }
}
```

### next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
};

export default nextConfig;
```

## Required Steps

### Step 1: Install Dependencies
```bash
# In your project directory
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your Groq API key
# Replace 'your-groq-api-key-here' with your actual key
```

### Step 3: Build the Application
```bash
npm run build
```

### Step 4: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Alternative: Vercel GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Groq integration"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select "Import from GitHub repository"
   - Select your repository
   - Set root directory: `/growth-strategy-app`
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Add environment variable: `GROQ_API_KEY`
   - Deploy

## Testing Locally

### Start Development Server
```bash
npm run dev
```

### Open in Browser
Open your browser and go to: `http://localhost:3000`

### API Testing
You can test the Groq API integration directly:

```bash
# Test API endpoint
curl -X POST https://api.groq.com/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instruct-preview-6gb",
    "messages": [
      {"role": "system", "content": "You are a growth strategy expert."},
      {"role": "user", "content": "Generate a marketing strategy for a SaaS company with $10k monthly budget."}
    ],
    "temperature": 0.7,
    "response_format": {"type": "json_object"}
  }'
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Groq API Key Error
**Symptom**: "GROQ_API_KEY environment variable is not set"
**Solution**: Make sure `.env.local` file exists and contains your Groq API key.

#### 2. Build Failures
**Symptom**: Next.js build errors
**Solution**: 
- Ensure all dependencies are installed (`npm install`)
- Check for syntax errors in TypeScript files
- Verify environment variable format

#### 3. API Response Errors
**Symptom**: Invalid response format from Groq
**Solution**: 
- Check your Groq API key is valid (https://console.groq.com)
- Verify you have access to the selected model (llama-3.1-8b-instruct-preview-6gb)
- Test API manually using the curl command above

### Model Selection

**Recommended Groq Model**: `llama-3.1-8b-instruct-preview-6gb`
- **Pros**: Balanced performance, cost-effective, supports JSON output
- **Alternatives**: `mixtral-8b-32768`, `gemma-7b-it`

## Deployment Costs

### Vercel Free Tier Limits:
- **Bandwidth**: 100GB per month
- **Requests**: 1M per month
- **Functions**: Cold startup time
- **SSL Certificate**: Free
- **Global CDN**: Included

### Estimated Monthly Costs (if you exceed limits):
- **Groq API**: ~$0.50 per 1M tokens (very cost-effective)
- **Vercel Pro**: $20/month (unlimited bandwidth and requests)

## Post-Deployment Verification

After deployment, verify your app is working:

1. **Check Application**: Visit your deployed URL
2. **Test Strategy Generation**: Fill out the form and generate a test strategy
3. **Verify Output**: Ensure strategy is displayed correctly
4. **Check API Integration**: Look for any API error messages

## Updating After Deployment

### With Vercel CLI
```bash
# Make changes to your code
git add .
git commit -m "Update strategies"
git push

# Deploy updates
vercel --prod
```

### With GitHub Integration
- Simply push changes to your repository
- Vercel will automatically rebuild and deploy

## Production Checklist

### Before Going Live:
- [ ] Groq API key is configured securely
- [ ] All dependencies are installed
- [ ] Application builds successfully
- [ ] Environment variables are set
- [ ] GitHub repository is connected to Vercel
- [ ] DNS is configured (optional)
- [ ] SSL certificate is active
- [ ] Performance testing is complete
- [ ] Analytics are set up (optional)

### After Going Live:
- [ ] Test all major features
- [ ] Verify strategy generation with real data
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Review performance metrics
- [ ] Gather user feedback

## Support and Maintenance

### Support Channels:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Readme and API documentation
- **Community**: Vercel community forums

### Regular Maintenance:
- **Backup**: Keep a backup of your code and environment variables
- **Updates**: Regularly check for updates to dependencies
- **Security**: Keep environment variables secure and rotate API keys periodically
- **Performance**: Monitor and optimize application performance

## Success Metrics

### Expected KPIs:
- **First Time Users**: Strategy generation in < 5 seconds
- **Success Rate**: 95%+ strategy generation success
- **User Retention**: 30%+ return users after strategy generation
- **Conversion**: 20%+ strategy export/download rate
- **Performance**: Page load < 2.5 seconds

### Monitoring:
- **Application Performance**: Vercel analytics
- **API Performance**: Groq API response times
- **User Experience**: User journey analytics
- **Error Rates**: Monitoring error logs

## Conclusion

By following these deployment instructions, you'll have a fully functional AI Growth Strategy Generator that uses Groq instead of OpenAI, offering a cost-effective and performant solution for generating personalized marketing strategies. The application is production-ready and optimized for Vercel's platform.

**Key Benefits**:
- ✅ **Cost Effective**: Groq is cheaper than many other AI providers
- ✅ **High Performance**: Fast inference times
- ✅ **Easy Deployment**: Vercel handles all infrastructure
- ✅ **Global CDN**: Low latency worldwide
- ✅ **Automatic Scaling**: Handles traffic spikes
- ✅ **Security**: Environment variable management
- ✅ **Monitoring**: Built-in analytics and logging

Your AI Growth Strategy Generator will be live within minutes of deployment and ready to serve thousands of users! 🚀