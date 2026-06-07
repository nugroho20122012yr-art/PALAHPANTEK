import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
// @ts-ignore
import _Jimp from "jimp";
const Jimp = _Jimp as any;

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.post("/api/crayons", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: "No image provided" });

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
        
        // Add texture/noise
        const noise = (Math.random() - 0.5) * 30;
        this.bitmap.data[idx + 0] = Math.min(255, Math.max(0, closest.r + noise));
        this.bitmap.data[idx + 1] = Math.min(255, Math.max(0, closest.g + noise));
        this.bitmap.data[idx + 2] = Math.min(255, Math.max(0, closest.b + noise));
      });

      jimg.contrast(0.2);
      
      const resultBase64 = await jimg.getBase64Async(Jimp.MIME_PNG);
      res.json({ result: resultBase64 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Processing failed" });
    }
  });

  app.post("/api/chat", (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    const lower = message.toLowerCase();
    let response = "";

    if (lower.includes('cara') || lower.includes('pakai') || lower.includes('how') || lower.includes('tutor')) {
      response = "Cara pakainya gampang! 1. Klik area Upload atau seret foto ke dalam kotak. 2. Klik tombol 'Generate Crayon'. 3. Tunggu sebentar dan simpan hasilnya!";
    } else if (lower.includes('warna') || lower.includes('color')) {
      response = "Web ini menggunakan 20 palet warna krayon premium yang menyesuaikan dengan gambar asli Anda secara otomatis.";
    } else if (lower.includes('halo') || lower.includes('hi') || lower.includes('p')) {
      response = "Halo! Saya adalah CID•AI Assistant. Ada yang bisa saya bantu terkait cara penggunaan web ini?";
    } else if (lower.includes('siapa') || lower.includes('pembuat') || lower.includes('developer')) {
      response = "Saya adalah asisten pintar dari CID•AI, dikembangkan khusus untuk konversi gambar bergaya krayon.";
    } else {
      response = "Maaf, ingatan saya terbatas hanya pada cara penggunaan web CID•AI ini. Silahkan coba tanya 'Bagaimana cara pakainya?' atau 'Warna apa saja yang tersedia?'.";
    }

    res.json({ response });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CID•AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
