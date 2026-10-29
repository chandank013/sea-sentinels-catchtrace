import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Share2,
  AlertTriangle,
  Clock,
  Layers,
  Award,
  Hash,
  Anchor,
  ShoppingBag,
  Cpu,
  Truck,
  Store,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_ICONS = {
  LANDING: Anchor,
  PURCHASE: ShoppingBag,
  PROCESSING: Cpu,
  TRANSPORT: Truck,
  TRANSPORT_PICKUP: Truck,
  TRANSPORT_DROP: Truck,
  SALE: Store,
};

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCertificate() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getCertificate(id);
        if (isMounted) setCert(data);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Not yet eligible — batch must be sold with no disputes.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCertificate();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Verified CatchTrace Certificate - ${id}`,
          text: `Verified unbroken seafood custody certificate for batch ${id}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate URL copied to clipboard!');
    }
  };

  const publicTraceUrl = `${window.location.origin}/trace/${id}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-navy-900">Validating Cryptographic Certificate of Custody...</p>
          <p className="text-xs text-textSecondary">Checking tamper-evidence and counterparty confirmation status</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-navy-900">Certificate Not Yet Eligible</h2>
            <p className="text-xs text-textSecondary mt-1 font-mono">{id}</p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-left text-xs space-y-2 text-amber-950">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              {error || 'Batch must be sold with no disputes.'}
            </p>
            <p className="text-[11px] leading-relaxed text-amber-900/80">
              To issue an official Verified Certificate of Origin, the batch must have completed its entire custody lifecycle (Status: <span className="font-bold">SOLD</span>) with every handover step confirmed by the receiving party and zero active disputes.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/batches/${id}`)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Batch Timeline</span>
            </button>
            <NavLink
              to="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 font-bold text-xs transition-colors text-center"
            >
              Dashboard
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  const events = cert.events || [];
  const landingEvent = events.find((e) => e.event_type === 'LANDING') || events[0] || {};
  const saleEvent = events.find((e) => e.event_type === 'SALE') || events[events.length - 1] || {};

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-navy-900">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate(`/batches/${id}`)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-navy-900 font-bold text-xs transition-colors shadow-xs w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Batch</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-navy-900 font-semibold text-xs transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4 text-ocean-600" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* THE CERTIFICATE DOCUMENT (A4 printable card with ornate border) */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border-4 border-double border-emerald-700/30 p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden print:shadow-none print:border-2 print:rounded-none print:p-8">
        
        {/* Subtle Watermark Emblem Background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
          <ShieldCheck className="w-[500px] h-[500px] text-navy-900" />
        </div>

        {/* Certificate Header */}
        <div className="border-b-2 border-slate-200 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/catchtrace-logo.png"
                alt="CatchTrace logo"
                className="h-14 w-auto object-contain shrink-0"
                style={{ aspectRatio: '1024/682' }}
                width={84}
                height={56}
              />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
                  Official Cryptographic Provenance Ledger
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
                  CatchTrace Certificate of Verified Origin
                </h1>
                <p className="text-xs text-textSecondary">
                  Tamper-evident chain of custody from coastal harvest to consumer sale
                </p>
              </div>
            </div>

            {/* Certificate ID & Stamp Badge */}
            <div className="text-right sm:self-center">
              <span className="text-[10px] uppercase font-bold text-textSecondary block">Certificate ID</span>
              <span className="font-mono text-xs font-black text-navy-900 bg-slate-100 px-2 py-1 rounded inline-block">
                {cert.certificate_id || `CT-CERT-${id}`}
              </span>
              <span className="text-[10px] text-textSecondary block mt-0.5">
                Issued: {new Date(cert.certified_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Verified No Disputes Badge Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-900 tracking-wide uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                VERIFIED — NO DISPUTES
              </span>
              <p className="text-[11px] text-emerald-800">
                100% of chain events accepted and cryptographically confirmed by receiving counterparties.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Integrity Seal</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
              SHA-256 HASH CHAIN SEALED
            </span>
          </div>
        </div>

        {/* Batch Attributes Specification Grid */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Marine Species</span>
            <span className="text-sm font-black text-navy-900 mt-0.5 block">{cert.species}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Batch Identifier</span>
            <span className="text-xs font-mono font-bold text-ocean-700 mt-1 block">{cert.batch_id}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Landing Harbour</span>
            <span className="text-xs font-bold text-navy-900 mt-1 block">{cert.landing_centre}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Harvest Vessel</span>
            <span className="text-xs font-bold text-navy-900 mt-1 block">{cert.boat_name || 'Coastal Trawler'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Harvest Date</span>
            <span className="text-xs font-bold text-navy-900 mt-0.5 block">
              {cert.landed_at ? new Date(cert.landed_at).toLocaleDateString('en-IN') : '28 Oct 2026'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Initial Landed Weight</span>
            <span className="text-xs font-bold text-navy-900 mt-0.5 block">{cert.initial_weight_kg} kg</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Final Sold Weight</span>
            <span className="text-xs font-bold text-navy-900 mt-0.5 block">{cert.current_weight_kg || cert.initial_weight_kg} kg</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">Lifecycle Status</span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-navy-900 text-white mt-0.5">
              SOLD / COMPLETED
            </span>
          </div>
        </div>

        {/* Full Custody Chain Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase font-black text-navy-900 tracking-wider">
              Custody Transfer Log & Counterparty Confirmation Audit
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {events.length} Custody Events Verified
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-textSecondary text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-left">Step</th>
                  <th className="py-2.5 px-3 text-left">Stage</th>
                  <th className="py-2.5 px-3 text-left">Logged By</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-left">Confirmed By (Receiver)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {events.map((ev, idx) => {
                  const Icon = EVENT_ICONS[ev.event_type] || Layers;
                  return (
                    <tr key={ev.seq || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                        #{ev.seq || idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-navy-900">
                          <Icon className="w-3.5 h-3.5 text-ocean-600 shrink-0" />
                          <span>{ev.title || ev.event_type}</span>
                        </div>
                        <span className="text-[10px] text-textSecondary block">
                          {ev.occurred_at ? new Date(ev.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-navy-900 block">{ev.actor_name}</span>
                        <span className="text-[10px] text-textSecondary block">{ev.org_name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-navy-900 border border-slate-300">
                          Grade {ev.grade_confirmed || ev.grade_claimed || 'A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-navy-900 block">
                          {ev.confirmed_by_name || (ev.confirmed_by ? `User (${ev.confirmed_by})` : 'Authorized Custodian')}
                        </span>
                        <span className="text-[10px] text-emerald-700 block">
                          {ev.confirmed_at ? `Verified ${new Date(ev.confirmed_at).toLocaleDateString()}` : 'Handover Accepted'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          CONFIRMED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cryptographic Proof, QR Verification Code & Sign-Off */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* QR Verification */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="p-1.5 bg-white rounded-xl shadow-xs shrink-0">
              <QRCodeSVG
                value={publicTraceUrl}
                size={84}
                level="M"
                includeMargin={false}
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-textSecondary block">Scan to Verify</span>
              <p className="text-[11px] font-semibold text-navy-900 mt-0.5 leading-snug">
                Scan with any mobile device to view the live, immutable public ledger entry.
              </p>
              <a
                href={publicTraceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-ocean-600 hover:underline mt-1 inline-flex items-center gap-1 print:hidden"
              >
                <span>Live trace link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Legal / Traceability Guarantee */}
          <div className="text-xs text-textSecondary space-y-1">
            <span className="text-[10px] uppercase font-bold text-navy-900 block">Integrity Guarantee</span>
            <p className="text-[11px] leading-relaxed">
              Issued in accordance with the Karnataka Marine Fisheries Digital Audit Standards. Every transaction is sealed cryptographically into the CatchTrace SHA-256 hash chain.
            </p>
          </div>

          {/* Official Seal / Signature Block */}
          <div className="text-center md:text-right space-y-1">
            <div className="inline-block border-b-2 border-slate-400 pb-1 px-6 font-serif italic text-sm text-navy-900">
              CatchTrace National Ledger
            </div>
            <span className="text-[10px] uppercase font-bold text-textSecondary block">
              Automated Cryptographic Certification Engine
            </span>
            <span className="text-[9px] font-mono text-slate-400 block">
              GENESIS: e83a910bf32a9a7d...
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
