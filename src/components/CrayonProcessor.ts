/**
 * Utility to process images into a crayon-style drawing.
 * Uses canvas for client-side processing to ensure infinite usage without API keys.
 */

export const CRAYON_PALETTE = [
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

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

const rgbPalette = CRAYON_PALETTE.map(p => hexToRgb(p.hex));

function findClosestColor(r: number, g: number, b: number) {
  let minDiff = Infinity;
  let closest = rgbPalette[0];

  for (const color of rgbPalette) {
    // Basic euclidean distance in RGB space
    const diff = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );
    if (diff < minDiff) {
      minDiff = diff;
      closest = color;
    }
  }
  return closest;
}

export async function convertToCrayon(imageFile: File, onProgress?: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject('Could not get canvas context');

      // Set manageable size for processing
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // 1. Quantize colors to the 9-crayon palette
      for (let i = 0; i < data.length; i += 4) {
        const closest = findClosestColor(data[i], data[i+1], data[i+2]);
        data[i] = closest.r;
        data[i+1] = closest.g;
        data[i+2] = closest.b;
        
        if (i % 10000 === 0 && onProgress) {
          onProgress(0.5 * (i / data.length));
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // 2. Add Crayon Texture
      // We simulate this by overlaying a noise pattern and slightly offsetting pixels
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return resolve(canvas.toDataURL());

      // Draw original quantized
      tempCtx.drawImage(canvas, 0, 0);

      // Create wax texture
      const textureData = tempCtx.getImageData(0, 0, width, height);
      const tData = textureData.data;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          
          // Add some grain/noise
          const noise = (Math.random() - 0.5) * 40;
          tData[i] = Math.min(255, Math.max(0, tData[i] + noise));
          tData[i+1] = Math.min(255, Math.max(0, tData[i+1] + noise));
          tData[i+2] = Math.min(255, Math.max(0, tData[i+2] + noise));
          
          // Occasional "clumping" of wax
          if (Math.random() > 0.98) {
             tData[i] = Math.max(0, tData[i] - 30);
             tData[i+1] = Math.max(0, tData[i+1] - 30);
             tData[i+2] = Math.max(0, tData[i+2] - 30);
          }
        }
        if (y % 10 === 0 && onProgress) {
          onProgress(0.5 + 0.5 * (y / height));
        }
      }
      
      tempCtx.putImageData(textureData, 0, 0);
      
      // Final polish: slight blur and sharpen to mimic paper absorption
      ctx.globalAlpha = 0.4;
      ctx.filter = 'blur(0.5px) contrast(1.2)';
      ctx.drawImage(tempCanvas, 0, 0);
      
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => reject('Failed to load image');
    img.src = URL.createObjectURL(imageFile);
  });
}
