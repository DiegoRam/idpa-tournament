const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to generate an icon
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - dark tactical theme
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Add a subtle gradient
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw a target/crosshair icon
  ctx.strokeStyle = '#4ade80'; // Green accent
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';

  // Outer circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Crosshairs
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = size * 0.02;
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(size * 0.1, size/2);
  ctx.lineTo(size * 0.35, size/2);
  ctx.moveTo(size * 0.65, size/2);
  ctx.lineTo(size * 0.9, size/2);
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(size/2, size * 0.1);
  ctx.lineTo(size/2, size * 0.35);
  ctx.moveTo(size/2, size * 0.65);
  ctx.lineTo(size/2, size * 0.9);
  ctx.stroke();

  // Add text for larger icons
  if (size >= 192) {
    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${size * 0.08}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('IDPA', size/2, size * 0.9);
  }

  return canvas;
}

// Generate all icon sizes
sizes.forEach(size => {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  fs.writeFileSync(filename, buffer);
  console.log(`Generated: ${filename}`);
});

// Generate a simple favicon.ico
const favicon = generateIcon(32);
const faviconBuffer = favicon.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), faviconBuffer);

console.log('All icons generated successfully!');