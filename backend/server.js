const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const https = require('https');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests. Please try again later.' }
});

// ── SQLite Database ──
const db = new sqlite3.Database(path.join(__dirname, 'urreal3d.db'), (err) => {
  if (err) console.error('DB error:', err);
  else console.log('✅ Database connected');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      brand TEXT,
      service TEXT,
      budget TEXT,
      message TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'new'
    )
  `);
});

// ── Generate PDF using PDFKit (pure Node.js, no external tools) ──
function generatePDF(inquiry) {
  return new Promise((resolve, reject) => {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });
      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width - 120; // usable width
      const purple = '#7c3aed';
      const dark   = '#06040f';
      const gray   = '#8a7aaa';
      const light  = '#f5f0ff';
      const ink    = '#1a1030';

      // Header bg
      doc.rect(0, 0, doc.page.width, 108).fill(dark);

      // Logo
      doc.fontSize(26).font('Helvetica-Bold').fillColor('#f0ebff')
         .text('Urreal', 60, 34, { continued: true })
         .fillColor(purple).text('3D');

      doc.fontSize(10).font('Helvetica').fillColor(gray)
         .text('Clothing Animation Studio', 60, 66);

      // Date + ID top right
      const dateStr = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.fontSize(9).fillColor(gray)
         .text(`Inquiry #${inquiry.id}  ·  ${dateStr}`, 60, 80, { align: 'right', width: W });

      // Purple stripe
      doc.rect(0, 108, doc.page.width, 3).fill(purple);

      // Page title
      doc.fontSize(20).font('Helvetica-Bold').fillColor(ink)
         .text('New Project Inquiry', 60, 130);
      doc.fontSize(11).font('Helvetica').fillColor(gray)
         .text('A client submitted the booking form on your website.', 60, 156);

      // Thin rule
      doc.moveTo(60, 178).lineTo(60 + W, 178)
         .strokeColor('#ddd6f0').lineWidth(1).stroke();

      // Info rows
      const fields = [
        ['Full Name', inquiry.name],
        ['Email',     inquiry.email],
        ['Brand',     inquiry.brand  || '—'],
        ['Service',   inquiry.service || '—'],
        ['Budget',    inquiry.budget  || '—'],
      ];

      let y = 192;
      fields.forEach(([label, value], i) => {
        if (i % 2 === 0) doc.rect(60, y - 5, W, 26).fill('#f8f5ff');
        doc.fontSize(9).font('Helvetica-Bold').fillColor(gray)
           .text(label.toUpperCase(), 68, y, { width: 100 });
        doc.fontSize(11).font('Helvetica').fillColor(ink)
           .text(String(value), 178, y, { width: W - 118 });
        y += 28;
      });

      // Message header
      y += 12;
      doc.rect(60, y, W, 24).fill(purple);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#f0ebff')
         .text('PROJECT MESSAGE', 68, y + 7);
      y += 32;

      // Message body
      const msgHeight = Math.max(70, Math.ceil(inquiry.message.length / 80) * 16 + 24);
      doc.rect(60, y, W, msgHeight).fill('#f8f5ff');
      doc.fontSize(11).font('Helvetica').fillColor(ink)
         .text(inquiry.message, 68, y + 10, { width: W - 16, lineGap: 3 });

      // Footer
      const fy = doc.page.height - 56;
      doc.rect(0, fy - 8, doc.page.width, 64).fill(dark);
      doc.moveTo(0, fy - 8).lineTo(doc.page.width, fy - 8)
         .strokeColor(purple).lineWidth(2).stroke();
      doc.fontSize(10).font('Helvetica').fillColor(gray)
         .text('Urreal3D  ·  Stephen R Christian  ·  +91 78598 74272', 60, fy + 4, {
           align: 'center', width: W
         });
      doc.fontSize(9).fillColor('#3d3050')
         .text('Auto-generated when the inquiry form was submitted.', 60, fy + 20, {
           align: 'center', width: W
         });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ── Send PDF to Telegram ──
function sendTelegramPDF(pdfBuffer, inquiry) {
  return new Promise((resolve) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId   = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.log('⚠️  Telegram not configured — skipping');
      return resolve();
    }

    // 1. Send text notification first
    const text = encodeURIComponent(
      `📩 *New Inquiry #${inquiry.id}*\n\n` +
      `👤 *Name:* ${inquiry.name}\n` +
      `📧 *Email:* ${inquiry.email}\n` +
      `🏷 *Brand:* ${inquiry.brand || '—'}\n` +
      `🎬 *Service:* ${inquiry.service || '—'}\n` +
      `💰 *Budget:* ${inquiry.budget || '—'}\n\n` +
      `_PDF attached below ↓_`
    );
    const textUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${text}&parse_mode=Markdown`;

    https.get(textUrl, () => {
      // 2. Send PDF as document via multipart
      const boundary = 'TGBoundary' + Date.now();
      const filename  = `Inquiry_${inquiry.name.replace(/\s+/g, '_')}_${inquiry.id}.pdf`;

      const header = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="chat_id"\r\n\r\n` +
        `${chatId}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n` +
        `Content-Type: application/pdf\r\n\r\n`
      );
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body   = Buffer.concat([header, pdfBuffer, footer]);

      const opts = {
        hostname: 'api.telegram.org',
        path:     `/bot${botToken}/sendDocument`,
        method:   'POST',
        headers:  {
          'Content-Type':   `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length
        }
      };

      const req = https.request(opts, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            const r = JSON.parse(raw);
            if (r.ok) console.log(`✅ PDF sent to Telegram — inquiry #${inquiry.id}`);
            else console.error('Telegram doc error:', r.description);
          } catch(e) {}
          resolve();
        });
      });
      req.on('error', e => { console.error('Telegram error:', e.message); resolve(); });
      req.write(body);
      req.end();
    }).on('error', e => { console.error('Telegram text error:', e.message); resolve(); });
  });
}

// ── POST /api/inquiry ──
app.post('/api/inquiry', limiter, async (req, res) => {
  const { name, email, brand, service, budget, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ error: 'Name, email, and message are required.' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address.' });

  db.run(
    `INSERT INTO inquiries (name, email, brand, service, budget, message) VALUES (?,?,?,?,?,?)`,
    [name, email, brand||'', service||'', budget||'', message],
    async function(err) {
      if (err) { console.error(err); return res.status(500).json({ error: 'DB error.' }); }

      const inquiry = { id: this.lastID, name, email, brand, service, budget, message };

      // Generate PDF + send to Telegram (non-blocking — client already gets success)
      res.json({ success: true, id: inquiry.id, message: 'Inquiry submitted!' });

      try {
        const pdf = await generatePDF(inquiry);
        await sendTelegramPDF(pdf, inquiry);
      } catch(e) {
        console.error('PDF/Telegram pipeline error:', e.message);
      }
    }
  );
});

// ── GET /api/inquiries — admin only ──
app.get('/api/inquiries', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  db.all('SELECT * FROM inquiries ORDER BY submitted_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => console.log(`🚀 Urreal3D running on http://localhost:${PORT}`));
