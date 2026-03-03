import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, '../public/images');

// Ensure images directory exists
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
}

const images = [
  { name: 'coke-zero.jpg', url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop&q=80' },
  { name: 'lays.jpg', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&q=80' },
  { name: 'mama.jpg', url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop&q=80' },
  { name: 'allcafe.jpg', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&q=80' },
  { name: 'chicken-rice.jpg', url: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&h=400&fit=crop&q=80' },
  { name: 'onigiri.jpg', url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop&q=80' },
  { name: 'meiji-milk.jpg', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&q=80' },
  { name: 'couque.jpg', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&q=80' },
  { name: 'redbull.jpg', url: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=400&fit=crop&q=80' },
  { name: 'sausage-bun.jpg', url: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=400&fit=crop&q=80' },
];

async function downloadImage(name, url) {
  try {
    console.log(`Downloading ${name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const filePath = join(imagesDir, name);
    writeFileSync(filePath, buffer);
    console.log(`✓ Saved ${name} (${buffer.length} bytes)`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to download ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Downloading product images from Unsplash...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const { name, url } of images) {
    const result = await downloadImage(name, url);
    if (result) success++;
    else failed++;
  }
  
  console.log(`\nDone! ${success} downloaded, ${failed} failed.`);
  console.log(`Images saved to: ${imagesDir}`);
}

main();

