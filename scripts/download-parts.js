// Script to download car part images from Wikimedia Commons
// Run with: node scripts/download-parts.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Wikimedia Commons direct image URLs (free, no API key needed)
const images = {
  'turbo.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Turbocharger.jpg/800px-Turbocharger.jpg',
  'engine.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Four-stroke_engine_diagram.jpg/800px-Four-stroke_engine_diagram.jpg',
  'brake.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Disk_brake_dsc03680.jpg/800px-Disk_brake_dsc03680.jpg',
  'wheel-bearing.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wheel_bearing.jpg/800px-Wheel_bearing.jpg',
  'suspension.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Macpherson_strut.jpg/800px-Macpherson_strut.jpg',
  'transmission.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gearbox_4_speed.jpg/800px-Gearbox_4_speed.jpg',
  'alternator.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Alternator_%28PSF%29.jpg/800px-Alternator_%28PSF%29.jpg',
  'battery.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Autobatterie.jpg/800px-Autobatterie.jpg',
  'radiator.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Car_radiator.jpg/800px-Car_radiator.jpg',
  'exhaust.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Exhaust_pipe.jpg/800px-Exhaust_pipe.jpg',
  'placeholder.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Four-stroke_engine_diagram.jpg/800px-Four-stroke_engine_diagram.jpg'
};

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, '..', 'public', 'parts', filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`✗ Failed to download ${filename}:`, err.message);
      reject(err);
    });
  });
};

async function downloadAll() {
  console.log('Downloading car part images from Wikimedia Commons...\n');
  
  // Create parts directory if it doesn't exist
  const partsDir = path.join(__dirname, '..', 'public', 'parts');
  if (!fs.existsSync(partsDir)) {
    fs.mkdirSync(partsDir, { recursive: true });
  }
  
  for (const [filename, url] of Object.entries(images)) {
    try {
      await downloadImage(url, filename);
      // Wait a bit between downloads to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${filename}`);
    }
  }
  
  console.log('\n✓ All images downloaded from Wikimedia Commons!');
  console.log('These images are free to use under Creative Commons licenses.');
}

downloadAll();
