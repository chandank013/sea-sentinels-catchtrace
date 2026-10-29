import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function QRCodeCard({ batchId, species, isNew = false }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const publicTraceUrl = `${window.location.origin}/trace/${batchId}`;

  const copyBatchId = () => {
    navigator.clipboard.writeText(batchId);
    setCopied(true);
    toast.success(`Copied ${batchId} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-svg-${batchId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 20, 20, 360, 360);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `CatchTrace-${batchId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code downloaded successfully!');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>CatchTrace QR - ${batchId}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .box { border: 2px dashed #0B2545; padding: 24px; border-radius: 12px; display: inline-block; }
            h2 { color: #0B2545; margin: 0 0 6px 0; }
            p { color: #62748A; margin: 0 0 16px 0; font-size: 14px; }
            .batch { font-family: monospace; font-size: 20px; font-weight: bold; background: #E0F2FE; color: #0369A1; padding: 6px 12px; border-radius: 6px; display: inline-block; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>CatchTrace™ Verified Batch</h2>
            <p>From Ocean to Your Plate</p>
            <div class="batch">${batchId}</div>
            <div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicTraceUrl)}" />
            </div>
            <p style="margin-top: 16px;">Scan to verify origin, handlers, and cold chain history.</p>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-ct border border-borderLight shadow-card p-6 flex flex-col items-center text-center">
      {isNew && (
        <div className="mb-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
          {t('newBatch.createdSuccess')}
        </div>
      )}

      {/* Batch ID Highlight Box matching reference mockup */}
      <div className="w-full bg-ocean-50/70 border border-ocean-200/80 rounded-xl py-2 px-3 mb-4">
        <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider block">
          {t('newBatch.batchIdLabel')}
        </span>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="font-mono text-base sm:text-lg font-bold text-ocean-700">
            {batchId}
          </span>
          <button
            onClick={copyBatchId}
            className="p-1 hover:bg-ocean-100 rounded text-ocean-700 transition-colors"
            title={t('actions.copyId')}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="p-4 bg-white rounded-2xl border-2 border-borderLight shadow-sm hover:border-ocean-400 transition-all mb-5 group">
        <QRCodeSVG
          id={`qr-svg-${batchId}`}
          value={publicTraceUrl}
          size={190}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/images/catchtrace-logo.png',
            x: undefined,
            y: undefined,
            height: 26,
            width: 39,
            excavate: true,
          }}
        />
        <div className="text-[11px] text-textSecondary mt-2 flex items-center justify-center gap-1">
          <span>{t('newBatch.qrPreviewSub')}</span>
        </div>
      </div>

      {/* Action Buttons matching mockup */}
      <div className="w-full space-y-2">
        <button
          onClick={downloadQR}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-ocean-600 hover:bg-ocean-700 text-white transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          {t('actions.downloadQr')}
        </button>

        <button
          onClick={printQR}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-50 hover:bg-slate-100 text-navy-900 border border-borderLight transition-colors"
        >
          <Printer className="w-4 h-4" />
          {t('actions.printQr')}
        </button>

        <NavLink
          to={`/trace/${batchId}`}
          target="_blank"
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ocean-600 hover:text-ocean-700 py-1.5 transition-colors"
        >
          <span>{t('actions.viewDetails')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </NavLink>
      </div>
    </div>
  );
}
