import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Anchor,
  ShoppingBag,
  Cpu,
  Truck,
  Store,
  CheckCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Scale,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Hash,
  Flag,
  Camera,
  X,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEP_ICONS = {
  LANDING: Anchor,
  PURCHASE: ShoppingBag,
  PROCESSING: Cpu,
  TRANSPORT: Truck,
  TRANSPORT_PICKUP: Truck,
  TRANSPORT_DROP: Truck,
  SALE: Store,
};

const STEP_COLORS = {
  LANDING: 'bg-emerald-600 text-white',
  PURCHASE: 'bg-sky-600 text-white',
  PROCESSING: 'bg-indigo-600 text-white',
  TRANSPORT: 'bg-tealbrand-500 text-white',
  TRANSPORT_PICKUP: 'bg-tealbrand-500 text-white',
  TRANSPORT_DROP: 'bg-tealbrand-500 text-white',
  SALE: 'bg-amber-600 text-white',
};

const EVENT_TITLES_KN = {
  'Catch Landed at Harbour': 'ಬಂದರಿನಲ್ಲಿ ಮೀನು ಇಳಿಸುವಿಕೆ',
  'Purchased at Auction': 'ಹರಾಜಿನಲ್ಲಿ ಖರೀದಿ',
  'Processing & Filleting': 'ಸಂಸ್ಕರಣೆ ಮತ್ತು ಫಿಲ್ಲೆಟಿಂಗ್',
  'Reefer Transport Departure': 'ಕೋಲ್ಡ್ ಚೈನ್ ಸಾಗಣೆ ಆರಂಭ',
  'Reefer Transport Delivery': 'ಕೋಲ್ಡ್ ಚೈನ್ ವಿತರಣೆ',
  'Retail Sale': 'ಚಿಲ್ಲರೆ ಮಾರಾಟ',
  'Transport Dispatch': 'ಸಾಗಣೆ ರವಾನೆ',
  'Transport Checkpoint': 'ಸಾಗಣೆ ತಪಾಸಣಾ ಕೇಂದ್ರ',
  'LANDING': 'ಮೀನು ಇಳಿಸುವಿಕೆ',
  'PURCHASE': 'ಹರಾಜು ಖರೀದಿ',
  'PROCESSING': 'ಸಂಸ್ಕರಣೆ',
  'TRANSPORT': 'ಸಾಗಣೆ',
  'SALE': 'ಮಾರಾಟ',
};

// Check if user is natural receiving actor who can confirm/dispute
function canActorConfirm(event, user) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  // The actor who logged it cannot confirm it
  if (event.actor_id && user.id && event.actor_id === user.id) return false;
  if (event.actor_name && user.name && event.actor_name.trim().toLowerCase() === user.name.trim().toLowerCase()) return false;

  const role = user.role;
  const type = event.event_type;

  // Natural sequence of custody:
  if (type === 'LANDING') return role === 'TRADER';
  if (type === 'PURCHASE') return role === 'PROCESSOR' || role === 'TRANSPORTER';
  if (type === 'PROCESSING') return role === 'TRANSPORTER' || role === 'SELLER';
  if (type.startsWith('TRANSPORT')) return role === 'SELLER' || role === 'PROCESSOR';
  if (type === 'SALE') return role === 'SELLER' || role === 'ADMIN';

  return false;
}

export default function Timeline({ events = [], isPublic = false, batchId = '', onRefresh }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [actionLoading, setActionLoading] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [disputeNote, setDisputeNote] = useState('');
  const [disputeGrade, setDisputeGrade] = useState('B');
  const [photoUrl, setPhotoUrl] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && disputeModalOpen) {
        setDisputeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disputeModalOpen]);

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-ct border border-borderLight text-textSecondary text-sm">
        {lang === 'kn' ? 'ಈ ಬ್ಯಾಚ್‌ಗೆ ಇನ್ನೂ ಯಾವುದೇ ಸರಪಳಿ ದಾಖಲೆಗಳು ದಾಖಲಾಗಿಲ್ಲ.' : 'No chain events recorded yet for this batch.'}
      </div>
    );
  }

  const handleConfirm = async (event) => {
    setActionLoading(true);
    try {
      await api.confirmEvent(batchId, event.seq, {});
      toast.success(lang === 'kn' ? 'ಹಂತವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ!' : 'Event handover accepted and confirmed!');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm event');
    } finally {
      setActionLoading(false);
    }
  };

  const openDisputeModal = (event) => {
    setSelectedEvent(event);
    setDisputeNote('');
    setDisputeGrade(event.grade_claimed === 'A' ? 'B' : 'C');
    setPhotoUrl('');
    setDisputeModalOpen(true);
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeNote.trim()) {
      toast.error(lang === 'kn' ? 'ದಯವಿಟ್ಟು ವಿವಾದದ ಟಿಪ್ಪಣಿಯನ್ನು ಬರೆಯಿರಿ' : 'Please provide a dispute reason');
      return;
    }

    setActionLoading(true);
    try {
      await api.disputeEvent(batchId, selectedEvent.seq, {
        dispute_note: disputeNote.trim(),
        photo_url: photoUrl.trim() || undefined,
        grade_confirmed: disputeGrade,
      });
      toast.success(lang === 'kn' ? 'ವಿವಾದವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ ಮತ್ತು ಎಚ್ಚರಿಕೆ ಸೃಷ್ಟಿಯಾಗಿದೆ!' : 'Dispute logged and audit alert triggered!');
      setDisputeModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to file dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result);
      toast.success(lang === 'kn' ? 'ಫೋಟೋ ಪುರಾವೆ ಲಗತ್ತಿಸಲಾಗಿದೆ' : 'Photo evidence attached');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative pl-6 sm:pl-8 py-4 space-y-8">
      {/* Continuous Vertical Connecting Line */}
      <div className="absolute top-6 bottom-6 left-9 sm:left-11 w-0.5 bg-gradient-to-b from-ocean-500 via-tealbrand-500 to-emerald-500"></div>

      {events.map((event, index) => {
        const IconComponent = STEP_ICONS[event.event_type] || CheckCircle;
        const colorClass = STEP_COLORS[event.event_type] || 'bg-ocean-600 text-white';
        const isTampered = event.hash && event.hash.startsWith('TAMPERED_');
        const displayTitle = lang === 'kn'
          ? (EVENT_TITLES_KN[event.title] || EVENT_TITLES_KN[event.event_type] || event.title || event.event_type)
          : (event.title || event.event_type);

        const status = event.confirmation_status || 'PENDING';
        const isPending = status === 'PENDING';
        const isConfirmed = status === 'CONFIRMED';
        const isDisputed = status === 'DISPUTED';
        const canConfirmThis = !isPublic && isPending && canActorConfirm(event, user);

        return (
          <div key={event.seq || index} className="relative flex items-start gap-4 sm:gap-6 group">
            
            {/* Event Stage Node Icon */}
            <div
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ring-4 ring-white shrink-0 ${
                isTampered ? 'bg-red-600 text-white animate-pulse' : isDisputed ? 'bg-rose-600 text-white' : colorClass
              }`}
            >
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            {/* Event Details Card matching mockup #8 */}
            <div className={`flex-1 bg-white rounded-xl p-5 border transition-all duration-200 shadow-subtle hover:shadow-card ${
              isTampered || isDisputed ? 'border-red-300 bg-red-50/20' : isConfirmed ? 'border-emerald-200/80' : 'border-borderLight'
            }`}>
              
              {/* Header: Event Title, Sequence Badge, Confirmation Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-borderLight/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded border border-ocean-100">
                    {lang === 'kn' ? `ಹಂತ #${event.seq}` : `Step #${event.seq}`}
                  </span>
                  <h4 className="text-base font-bold text-navy-900">{displayTitle}</h4>

                  {/* Confirmation Status Badge (Green Check, Red Flag, Grey Clock) */}
                  {isConfirmed && (
                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Confirmed'}</span>
                      </span>
                      {canActorConfirm(event, user) && !isPublic && (
                        <button
                          type="button"
                          onClick={() => openDisputeModal(event)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors shadow-2xs"
                          title={lang === 'kn' ? 'ವಿವಾದ ದಾಖಲಿಸಿ' : 'Flag discrepancy or file dispute on this step'}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>{lang === 'kn' ? 'ವಿವಾದಿಸಿ' : 'Dispute'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isDisputed && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <Flag className="w-3.5 h-3.5 text-rose-600" />
                      <span>{lang === 'kn' ? 'ವಿವಾದಿತ' : 'Disputed'}</span>
                    </span>
                  )}

                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lang === 'kn' ? 'ದೃಢೀಕರಣ ಬಾಕಿ' : 'Pending Confirmation'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-textSecondary">
                  {/* Claimed / Confirmed Grade Badge */}
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {lang === 'kn' ? 'ದರ್ಜೆ: ' : 'Grade: '}
                    <strong className="text-navy-900 font-bold">{event.grade_claimed || 'A'}</strong>
                    {event.grade_confirmed && event.grade_confirmed !== event.grade_claimed && (
                      <span className="text-rose-600 font-bold ml-1">
                        → {event.grade_confirmed}
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-ocean-600" />
                    <span>
                      {event.occurred_at
                        ? new Date(event.occurred_at).toLocaleString(lang === 'kn' ? 'kn-IN' : 'en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-3.5 text-xs">
                
                {/* Weight */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Scale className="w-4 h-4 text-ocean-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                      {lang === 'kn' ? 'ದಾಖಲಿತ ತೂಕ' : 'Recorded Weight'}
                    </span>
                    <span className="text-sm font-bold text-navy-900">
                      {event.weight_kg ? `${event.weight_kg} kg` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                      {lang === 'kn' ? 'ಸ್ಥಳ' : 'Location'}
                    </span>
                    <span className="text-xs font-semibold text-navy-900 truncate block max-w-[170px]" title={event.location}>
                      {event.location || (lang === 'kn' ? 'ಬಂದರು ಪ್ರದೇಶ' : 'Harbour Zone')}
                    </span>
                  </div>
                </div>

                {/* Actor / Organization */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                      {lang === 'kn' ? 'ನಿರ್ವಾಹಕ / ಸಂಸ್ಥೆ' : 'Handler / Org'}
                    </span>
                    <span className="text-xs font-semibold text-navy-900 truncate block max-w-[170px]" title={event.org_name}>
                      {event.org_name || event.actor_name || (lang === 'kn' ? 'ಅಧಿಕೃತ ನಿರ್ವಾಹಕ' : 'Authorized Operator')}
                    </span>
                  </div>
                </div>

                {/* Temperature if recorded */}
                {event.temp_c !== undefined && (
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Thermometer className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                        {lang === 'kn' ? 'ಶೇಖರಣಾ ತಾಪಮಾನ' : 'Storage Temp'}
                      </span>
                      <span className={`text-xs font-bold ${event.temp_c > 4 ? 'text-amber-600' : 'text-navy-900'}`}>
                        {event.temp_c}°C {event.temp_c <= 4 ? (lang === 'kn' ? '❄️ ತಂಪು' : '❄️ Cold') : (lang === 'kn' ? '⚠️ ಸಾಮಾನ್ಯ' : '⚠️ Ambient')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Yield % if Processing */}
                {event.yield_percent !== undefined && (
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-sm font-bold text-emerald-600 shrink-0">⚡</span>
                    <div>
                      <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                        {lang === 'kn' ? 'ಸಂಸ್ಕರಣಾ ಇಳುವರಿ' : 'Processing Yield'}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {event.yield_percent}% {lang === 'kn' ? 'ಇಳುವರಿ' : 'yield'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price if Internal and Authorized Party */}
                {!isPublic && event.price_per_kg && (
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-navy-900 shrink-0">₹</span>
                    <div>
                      <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                        {lang === 'kn' ? 'ಪ್ರತಿ ಕೆಜಿ ದರ' : 'Price per kg'}
                      </span>
                      <span className="text-xs font-bold text-navy-900">
                        ₹{event.price_per_kg} / kg
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Event Notes */}
              {event.notes && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-textSecondary italic">
                  "{event.notes}"
                </div>
              )}

              {/* Live Camera Photo Evidence Thumbnail (Locked in Hash Chain) */}
              {event.photo_url && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <a
                      href={event.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group shrink-0"
                      title="Click to view full photo evidence"
                    >
                      <img
                        src={event.photo_url}
                        alt={`Step #${event.seq} Live Photo Evidence`}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-slate-300 shadow-2xs group-hover:opacity-90 transition-opacity"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg text-white text-[10px] font-bold transition-opacity">
                        View
                      </span>
                    </a>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Camera className="w-3.5 h-3.5 text-ocean-600 shrink-0" />
                        <span className="text-xs font-bold text-navy-900">
                          {lang === 'kn' ? 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ ಪುರಾವೆ' : 'Live Camera Evidence'}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                          SHA-256 Locked
                        </span>
                      </div>
                      {event.photo_hash && (
                        <p className="text-[10px] font-mono text-textMuted mt-0.5 truncate max-w-[180px] sm:max-w-[320px]" title={event.photo_hash}>
                          Hash: {event.photo_hash.slice(0, 14)}...{event.photo_hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>

                  <a
                    href={event.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-ocean-700 hover:text-ocean-800 hover:underline shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    Open Image &rarr;
                  </a>
                </div>
              )}

              {/* Dispute Warning & Evidence Callout */}
              {isDisputed && (
                <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{lang === 'kn' ? 'ವಿವಾದದ ದಾಖಲೆ:' : 'Handover Disputed by Counterparty:'}</span>
                  </div>
                  <p className="text-rose-800 leading-relaxed font-medium">"{event.dispute_note || 'Grade / weight variance flagged'}"</p>
                  {event.photo_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={event.photo_url}
                        alt="Dispute inspection proof"
                        className="w-20 h-16 object-cover rounded-md border border-rose-300 shadow-2xs"
                      />
                      <span className="text-[11px] text-rose-700 italic">{lang === 'kn' ? 'ಪರಿಶೀಲನಾ ಫೋಟೋ ಲಗತ್ತಿಸಲಾಗಿದೆ' : 'Inspection photo evidence attached'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tamper Warning if broken */}
              {isTampered && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    {lang === 'kn'
                      ? 'ತಿರುಚುವಿಕೆ ಎಚ್ಚರಿಕೆ: ಈ ಹಂತದ ಹ್ಯಾಶ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ಸಂಗ್ರಹಿಸಿದ ದಾಖಲೆಯನ್ನು ಬದಲಾಯಿಸಲಾಗಿದೆ.'
                      : 'Tamper Alert: Hash check failed for this event. Stored record was modified.'}
                  </span>
                </div>
              )}

              {/* Accept & Dispute Button Pair for Receiving Counterparty */}
              {canConfirmThis && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/60">
                  <div className="text-xs text-amber-900 font-medium">
                    <span>
                      {lang === 'kn'
                        ? 'ನೀವು ಈ ಹಂತದ ಸ್ವೀಕರಿಸುವ ಪಾಲುದಾರರಾಗಿದ್ದೀರಿ. ಗುಣಮಟ್ಟವನ್ನು ದೃಢೀಕರಿಸಿ ಅಥವಾ ವಿವಾದಿಸಿ:'
                        : 'You are the receiving partner for this handover. Confirm or dispute:'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirm(event)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'kn' ? 'ಸ್ವೀಕರಿಸಿ (ದೃಢೀಕರಿಸಿ)' : 'Accept Handover'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDisputeModal(event)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{lang === 'kn' ? 'ವಿವಾದಿಸಿ' : 'Dispute'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Internal Cryptographic Hash Ribbon (Internal view only) */}
              {!isPublic && event.hash && (
                <div className="mt-3 pt-2.5 border-t border-borderLight/40 flex items-center justify-between text-[10px] text-textSecondary font-mono">
                  <div className="flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                    <Hash className="w-3 h-3 text-ocean-500 shrink-0" />
                    <span className="truncate">hash: {event.hash}</span>
                  </div>
                  <span className="text-emerald-700 font-sans font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    {lang === 'kn' ? 'SHA-256 ಸುರಕ್ಷಿತ' : 'SHA-256 Intact'}
                  </span>
                </div>
              )}

            </div>
          </div>
        );
      })}

      {/* ========================================================= */}
      {/* DISPUTE MODAL (Mounted via Portal to escape all containers) */}
      {/* ========================================================= */}
      {disputeModalOpen && selectedEvent && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDisputeModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-borderLight" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-borderLight flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">
                    {lang === 'kn' ? 'ಹಸ್ತಾಂತರ ವಿವಾದ ನೋಂದಣಿ' : `Dispute Step #${selectedEvent.seq} (${selectedEvent.title})`}
                  </h3>
                  <p className="text-[11px] text-textSecondary">{batchId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'kn' ? 'ವಿವಾದದ ಕಾರಣ / ವಿವರಣೆ' : 'Dispute Reason / Discrepancy Note'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder={lang === 'kn' ? 'ಉದಾ. ಮೀನಿನ ಗುಣಮಟ್ಟ ಹದಗೆಟ್ಟಿದೆ, ತೂಕದಲ್ಲಿ 25 ಕೆಜಿ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ...' : 'e.g. Fish freshness degraded, weight shortfall of 25kg observed at scale...'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'kn' ? 'ಸ್ವೀಕರಿಸುವವರು ದೃಢಪಡಿಸಿದ ದರ್ಜೆ' : 'Confirmed Quality Grade'}
                </label>
                <select
                  value={disputeGrade}
                  onChange={(e) => setDisputeGrade(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                >
                  <option value="A">{lang === 'kn' ? 'ದರ್ಜೆ A (ಉತ್ತಮ)' : 'Grade A (Premium)'}</option>
                  <option value="B">{lang === 'kn' ? 'ದರ್ಜೆ B (ಮಧ್ಯಮ)' : 'Grade B (Standard)'}</option>
                  <option value="C">{lang === 'kn' ? 'ದರ್ಜೆ C (ಕಳಪೆ / ಸಂಸ್ಕರಣೆಗೆ ಮಾತ್ರ)' : 'Grade C (Low Quality / Processing only)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'kn' ? 'ಫೋಟೋ ಸಾಕ್ಷ್ಯ (ಐಚ್ಛಿಕ)' : 'Photo Evidence (Optional)'}
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lang === 'kn' ? 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoUrl && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {t('actions.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Logging...' : (lang === 'kn' ? 'ವಿವಾದ ದಾಖಲಿಸಿ' : 'Submit Dispute')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
