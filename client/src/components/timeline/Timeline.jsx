import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Anchor,
  ShoppingBag,
  Cpu,
  Truck,
  Store,
  CheckCircle,
  Clock,
  MapPin,
  Scale,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Hash,
} from 'lucide-react';

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

export default function Timeline({ events = [], isPublic = false }) {
  const { lang } = useLanguage();

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-ct border border-borderLight text-textSecondary text-sm">
        {lang === 'kn' ? 'ಈ ಬ್ಯಾಚ್‌ಗೆ ಇನ್ನೂ ಯಾವುದೇ ಸರಪಳಿ ದಾಖಲೆಗಳು ದಾಖಲಾಗಿಲ್ಲ.' : 'No chain events recorded yet for this batch.'}
      </div>
    );
  }

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

        return (
          <div key={event.seq || index} className="relative flex items-start gap-4 sm:gap-6 group">
            
            {/* Event Stage Node Icon */}
            <div
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ring-4 ring-white shrink-0 ${
                isTampered ? 'bg-red-600 text-white animate-pulse' : colorClass
              }`}
            >
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            {/* Event Details Card matching mockup #8 */}
            <div className={`flex-1 bg-white rounded-xl p-5 border transition-all duration-200 shadow-subtle hover:shadow-card ${
              isTampered ? 'border-red-300 bg-red-50/30' : 'border-borderLight'
            }`}>
              
              {/* Header: Event Title, Sequence Badge, Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-borderLight/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded border border-ocean-100">
                    {lang === 'kn' ? `ಹಂತ #${event.seq}` : `Step #${event.seq}`}
                  </span>
                  <h4 className="text-base font-bold text-navy-900">{displayTitle}</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-textSecondary">
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

                {/* Price if Internal and Purchase/Sale */}
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
    </div>
  );
}
