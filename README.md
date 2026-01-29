# Color Vibe Analyzer

A web application that analyzes color palettes from uploaded photos and provides styling insights for decor, makeup, wardrobe, and photography.

## Features

- Upload up to 20 images (drag-and-drop or file picker)
- Extract dominant color palettes from each image
- Generate combined color palette across all images
- Get AI-style insights including:
  - Vibe and mood tags
  - Colors to use and avoid
  - Decor and scene ideas
  - Makeup and styling tips
  - Wardrobe color suggestions
  - Photography direction

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
color-vibe-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── ImageUploader.tsx   # Drag-and-drop file uploader
│   ├── PaletteDisplay.tsx  # Color palette visualization
│   ├── ImagePaletteCard.tsx # Individual image palette card
│   └── InsightsDisplay.tsx # AI insights display
├── lib/
│   ├── colorAnalysis.ts    # Color extraction algorithms
│   ├── mockInsights.ts     # Mock AI insights generator
│   └── insights.ts         # Insights API abstraction
└── package.json
```

## How It Works

1. **Image Upload**: Users can upload up to 20 images via drag-and-drop or file picker
2. **Color Extraction**: Client-side algorithm extracts dominant colors from each image using canvas-based quantization
3. **Palette Combination**: Colors from all images are combined and analyzed for warm/cool balance, saturation, and brightness
4. **Insight Generation**: Rule-based mock AI generates styling suggestions based on palette characteristics
5. **Results Display**: Shows combined palette, per-image palettes, and comprehensive styling insights

## Deployment

This project is configured for deployment on Vercel with automatic CI/CD.

### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

### Documentation

All deployment and setup guides are available in the [`docs/`](./docs/) folder:
- [Deployment Guide](./docs/DEPLOYMENT.md) - Complete deployment instructions
- [Quick Start](./docs/QUICK_START.md) - Quick reference for pushing to GitHub
- [Vercel Deployment](./docs/VERCEL_DEPLOY.md) - Step-by-step Vercel setup
- [Git Setup](./docs/GIT_SETUP.md) - Git repository configuration
- [Troubleshooting](./docs/DEPLOYMENT_FIX.md) - Common deployment issues and fixes

### CI/CD Features

- **Automatic deployments** on push to `main` branch
- **Preview deployments** for every branch and pull request
- **GitHub Actions** for linting and type checking
- **Zero-config** setup with Vercel

## Future Enhancements

- Replace mock insights with real AI API integration
- Add user authentication and saved sessions
- Export palettes as color swatches
- Share results via URL

## License

MIT
