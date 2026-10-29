import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/upload
// Accepts base64 image data or file payload and stores it with SHA-256 verification
router.post('/', (req, res) => {
  const { image, filename } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    let buffer;
    let ext = '.jpg';

    if (image.startsWith('data:')) {
      const match = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        ext = '.' + (match[1] === 'jpeg' ? 'jpg' : match[1]);
        buffer = Buffer.from(match[2], 'base64');
      } else {
        const parts = image.split(',');
        buffer = Buffer.from(parts[1] || image, 'base64');
      }
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const photo_hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const safeName = `ev_photo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const fullUrl = `${protocol}://${host}/uploads/${safeName}`;

    return res.json({
      url: fullUrl,
      path: `/uploads/${safeName}`,
      photo_hash,
      bytes: buffer.length,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to process image upload' });
  }
});

export default router;
