# Deployment Guide - Jabroni Beaters Fantasy Football League

## Pre-Deployment Checklist

- [ ] Update league ID in `src/constants/config.js`
- [ ] Update site URL in SEO meta tags (`index.html`)
- [ ] Update sitemap URLs in `public/sitemap.xml`
- [ ] Create favicon and app icons (192x192 and 512x512)
- [ ] Create Open Graph image (`public/og-image.png`) - recommended 1200x630px
- [ ] Review and update environment variables
- [ ] Test build locally with `npm run build && npm run preview`
- [ ] Remove any development console.logs (auto-removed in production build)

## Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build will be output to the `dist/` directory.

## Deployment Options

### Option 1: Netlify (Recommended)

1. **Connect Repository**
   - Go to https://netlify.com and create a new site
   - Connect your GitHub/GitLab repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher

3. **Environment Variables** (Optional)
   - Add any custom environment variables in Netlify UI under Site Settings > Environment Variables

4. **Deploy**
   - Netlify will automatically deploy on every push to main branch
   - The `_redirects` file in public/ handles client-side routing

### Option 2: Vercel

1. **Import Project**
   - Go to https://vercel.com
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Deploy**
   - Click "Deploy"
   - Vercel automatically handles routing for SPAs

### Option 3: Traditional Web Hosting (Apache/Nginx)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload dist/ contents**
   - Upload everything inside the `dist/` folder to your web server

3. **Configure Server**

   **Apache:** The `.htaccess` file in public/ will be copied to dist/ automatically

   **Nginx:** Add this to your nginx.conf:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }

   # Enable gzip compression
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

   # Cache static assets
   location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

### Option 4: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Post-Deployment

1. **Verify SEO**
   - Test with Google's Rich Results Test: https://search.google.com/test/rich-results
   - Validate Open Graph tags: https://www.opengraph.xyz/
   - Check Twitter Card: https://cards-dev.twitter.com/validator

2. **Submit Sitemap**
   - Submit `https://yourdomain.com/sitemap.xml` to:
     - Google Search Console
     - Bing Webmaster Tools

3. **Performance Testing**
   - Run Lighthouse audit in Chrome DevTools
   - Test on mobile devices
   - Verify loading times

4. **Monitor**
   - Set up analytics (Google Analytics, Plausible, etc.)
   - Monitor error logs
   - Check API rate limits with Sleeper API

## Custom Domain Setup

### Netlify
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Let's Encrypt)

### Vercel
1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records
4. HTTPS is automatic

## Environment Variables

If you need to use environment variables:

1. Copy `.env.example` to `.env`
2. Update values
3. Variables must be prefixed with `VITE_` to be exposed to the app
4. Never commit `.env` to version control

Example:
```env
VITE_LEAGUE_ID=1234567890
VITE_SITE_URL=https://jabronibeaters.com
```

## Optimization Tips

1. **Images**: Optimize all images before deployment (use tools like TinyPNG)
2. **Fonts**: Already optimized with Google Fonts preconnect
3. **Caching**: Static assets are cached for 1 year
4. **Compression**: Gzip enabled for all text-based files
5. **Code Splitting**: React vendor code split into separate chunk
6. **Console Removal**: All console.logs removed in production build

## Troubleshooting

**404 on refresh**: Make sure your hosting platform is configured for SPA routing
- Netlify: `_redirects` file
- Vercel: Automatic
- Apache: `.htaccess` file
- Nginx: `try_files` directive

**Blank page**: Check browser console for errors, usually CORS or API issues

**Slow loading**: Run Lighthouse audit and optimize based on recommendations

## Support

For issues with:
- Sleeper API: https://docs.sleeper.com/
- React/Vite: https://vitejs.dev/
- Deployment platforms: Check their respective documentation
