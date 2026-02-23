# Download Car Part Images

## Option 1: Run the download script (Recommended)

```bash
node scripts/download-parts.js
```

This will automatically download all car part images to `public/parts/`

## Option 2: Manual download

Download these free images and save them to `public/parts/`:

1. **Turbo**: https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800
   - Save as: `turbo.jpg`

2. **Engine**: https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800
   - Save as: `engine.jpg`

3. **Brake**: https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800
   - Save as: `brake.jpg`

4. **Wheel Bearing**: https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800
   - Save as: `wheel-bearing.jpg`

5. **Suspension**: https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800
   - Save as: `suspension.jpg`

6. **Transmission**: https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800
   - Save as: `transmission.jpg`

7. **Alternator**: https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800
   - Save as: `alternator.jpg`

8. **Battery**: https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800
   - Save as: `battery.jpg`

9. **Radiator**: https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800
   - Save as: `radiator.jpg`

10. **Exhaust**: https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800
    - Save as: `exhaust.jpg`

11. **Placeholder**: https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800
    - Save as: `placeholder.jpg`

## Option 3: Use PowerShell to download

```powershell
# Create directory
New-Item -ItemType Directory -Force -Path public\parts

# Download images
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800" -OutFile "public\parts\turbo.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800" -OutFile "public\parts\engine.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800" -OutFile "public\parts\brake.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" -OutFile "public\parts\wheel-bearing.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800" -OutFile "public\parts\suspension.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800" -OutFile "public\parts\transmission.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800" -OutFile "public\parts\alternator.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800" -OutFile "public\parts\battery.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800" -OutFile "public\parts\radiator.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800" -OutFile "public\parts\exhaust.jpg"
Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800" -OutFile "public\parts\placeholder.jpg"
```

## After downloading

The images will be automatically used by the diagnostic system. No API key needed!

## Future: S3 Storage

Later, we'll move these to AWS S3 for:
- Faster CDN delivery
- Better scalability
- Cost optimization
