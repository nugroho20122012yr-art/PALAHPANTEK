const Jimp = require("jimp");

const CRAYON_PALETTE = [
  { name: 'Red', hex: '#E63946' },
  { name: 'Scarlet', hex: '#D62828' },
  { name: 'Orange', hex: '#F77F00' },
  { name: 'Amber', hex: '#FCBF49' },
  { name: 'Yellow', hex: '#EAE2B7' },
  { name: 'Lime', hex: '#D9ED92' },
  { name: 'Green', hex: '#B5E48C' },
  { name: 'Emerald', hex: '#34D399' },
  { name: 'Teal', hex: '#1D3557' },
  { name: 'Cyan', hex: '#A8DADC' },
  { name: 'Sky Blue', hex: '#457B9D' },
  { name: 'Blue', hex: '#1D3557' },
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Purple', hex: '#582F0E' },
  { name: 'Pink', hex: '#F472B6' },
  { name: 'Rose', hex: '#FB7185' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Gray', hex: '#4B5563' },
  { name: 'Black', hex: '#000000' }
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

const rgbPalette = CRAYON_PALETTE.map(p => hexToRgb(p.hex));

function findClosestColor(r, g, b) {
  let minDiff = Infinity;
  let closest = rgbPalette[0];
  for (const color of rgbPalette) {
    const diff = Math.sqrt(Math.pow(r - color.r, 2) + Math.pow(g - color.g, 2) + Math.pow(b - color.b, 2));
    if (diff < minDiff) {
      minDiff = diff;
      closest = color;
    }
  }
  return closest;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
    const { image } = JSON.parse(event.body);
    if (!image) return { statusCode: 400, body: "No image" };

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const jimg = await Jimp.read(buffer);
    jimg.scaleToFit(800, 800);
    const { width, height } = jimg.bitmap;

    jimg.scan(0, 0, width, height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const closest = findClosestColor(r, g, b);
      const noise = (Math.random() - 0.5) * 30;
      this.bitmap.data[idx + 0] = Math.min(255, Math.max(0, closest.r + noise));
      this.bitmap.data[idx + 1] = Math.min(255, Math.max(0, closest.g + noise));
      this.bitmap.data[idx + 2] = Math.min(255, Math.max(0, closest.b + noise));
    });

    jimg.contrast(0.2);
    const resultBase64 = await jimg.getBase64Async(Jimp.MIME_PNG);

    return {
      statusCode: 200,
      body: JSON.stringify({ result: resultBase64 }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Processing failed" };
  }
};
