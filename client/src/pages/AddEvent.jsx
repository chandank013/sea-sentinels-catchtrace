import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import QRScannerModal from '../components/qr/QRScannerModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  Cpu,
  Truck,
  Store,
  QrCode,
  Scale,
  DollarSign,
  MapPin,
  Clock,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddEvent() {
  const { id: urlBatchId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [batchId, setBatchId] = useState(urlBatchId || 'FB-20261028-0001');
  const [currentBatch, setCurrentBatch] = useState(null);
  const [counterparty, setCounterparty] = useState(null);
  const [gradeClaimed, setGradeClaimed] = useState('A');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Role determine active event form type
  const userRole = user?.role || 'TRADER';
  const [eventType, setEventType] = useState(() => {
    if (userRole === 'TRADER') return 'PURCHASE';
    if (userRole === 'PROCESSOR') return 'PROCESSING';
    if (userRole === 'TRANSPORTER') return 'TRANSPORT';
    if (userRole === 'SELLER') return 'SALE';
    return 'PURCHASE'; // Admin default
  });

  // Trader Form States
  const [purchaseWeight, setPurchaseWeight] = useState('240');
  const [purchasePricePerKg, setPurchasePricePerKg] = useState('150');
  const [buyerName, setBuyerName] = useState('Coastal Foods Pvt Ltd');
  const [purchaseLocation, setPurchaseLocation] = useState('Mangaluru Harbour');
  const [purchaseNotes, setPurchaseNotes] = useState('Auction lot, prime quality grade');

  // Processor Form States
  const [inputWeight, setInputWeight] = useState('220');
  const [outputWeight, setOutputWeight] = useState('180');
  const [processType, setProcessType] = useState('Cleaning & Packing');
  const [processLocation, setProcessLocation] = useState('Baikampady Industrial Area');
  const [processNotes, setProcessNotes] = useState('Cleaned, packed and blast frozen');

  // Transporter Form States
  const [pickupLocation, setPickupLocation] = useState('Mangaluru Harbour');
  const [dropLocation, setDropLocation] = useState('Bengaluru Wholesale Market');
  const [pickupTime, setPickupTime] = useState('2026-10-28T14:30');
  const [dropTime, setDropTime] = useState('2026-10-29T08:00');
  const [temperature, setTemperature] = useState('4.0');
  const [transportNotes, setTransportNotes] = useState('Refrigerated reefer truck KA-19-B-8821');

  // Seller Form States
  const [saleWeight, setSaleWeight] = useState('175');
  const [salePricePerKg, setSalePricePerKg] = useState('280');
  const [customerType, setCustomerType] = useState('Retailer / Supermarket');
  const [saleLocation, setSaleLocation] = useState('Bengaluru Wholesale Market');
  const [saleNotes, setSaleNotes] = useState('Fresh seafood counter retail supply');

  // Calculations
  const purchaseTotal = Number(purchaseWeight || 0) * Number(purchasePricePerKg || 0);
  const yieldPercent =
    Number(inputWeight) > 0 ? ((Number(outputWeight || 0) / Number(inputWeight)) * 100).toFixed(1) : 0;
  const saleTotal = Number(saleWeight || 0) * Number(salePricePerKg || 0);

  // Load batch details and counterparty trust score when batchId changes
  useEffect(() => {
    let isMounted = true;
    async function loadBatch() {
      if (!batchId) return;
      setLoading(true);
      try {
        const data = await api.getBatchById(batchId.trim());
        if (isMounted && data) {
          setCurrentBatch(data);
          // Auto fill initial weights based on current batch weight
          if (data.current_weight_kg) {
            setPurchaseWeight(data.current_weight_kg.toString());
            setInputWeight(data.current_weight_kg.toString());
            setOutputWeight(Math.round(data.current_weight_kg * 0.82).toString());
            setSaleWeight(data.current_weight_kg.toString());
          }

          // Identify counterparty (the actor who logged the prior step)
          const events = data.events || [];
          const lastEv = events.length > 0 ? events[events.length - 1] : null;
          const counterpartyId = lastEv?.actor_id || data.user_id || 'usr_fisher_01';
          const counterpartyName = lastEv?.actor_name || data.operator_name || 'Previous Custodian';
          const counterpartyOrg = lastEv?.org_name || data.boat_name || '';

          try {
            const scoreData = await api.getUserTrustScore(counterpartyId);
            if (isMounted) {
              setCounterparty({
                id: counterpartyId,
                name: counterpartyName,
                org: counterpartyOrg,
                trustScore: scoreData?.trust_score ?? 100,
                confirmedCount: scoreData?.confirmed_count ?? 0,
                disputedCount: scoreData?.disputed_count ?? 0,
              });
            }
          } catch {
            if (isMounted) {
              setCounterparty({
                id: counterpartyId,
                name: counterpartyName,
                org: counterpartyOrg,
                trustScore: 100,
                confirmedCount: 0,
                disputedCount: 0,
              });
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setCurrentBatch(null);
          setCounterparty(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBatch();
    return () => {
      isMounted = false;
    };
  }, [batchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!batchId) {
      toast.error('Please enter a valid Batch ID');
      return;
    }

    if (currentBatch && currentBatch.status === 'SOLD') {
      toast.error('This batch is already SOLD. Further events are permanently closed.');
      return;
    }

    setSubmitting(true);
    try {
      let eventPayload = {
        event_type: eventType,
        grade_claimed: gradeClaimed,
      };

      if (eventType === 'PURCHASE') {
        eventPayload = {
          ...eventPayload,
          weight_kg: Number(purchaseWeight),
          price_per_kg: Number(purchasePricePerKg),
          location: purchaseLocation,
          notes: `${purchaseNotes}. Buyer: ${buyerName}`,
        };
      } else if (eventType === 'PROCESSING') {
        eventPayload = {
          ...eventPayload,
          weight_kg: Number(outputWeight),
          input_weight_kg: Number(inputWeight),
          yield_percent: Number(yieldPercent),
          process_type: processType,
          location: processLocation,
          notes: processNotes,
        };
      } else if (eventType === 'TRANSPORT') {
        eventPayload = {
          ...eventPayload,
          weight_kg: currentBatch ? currentBatch.current_weight_kg : 200,
          location: `${pickupLocation} → ${dropLocation}`,
          temp_c: temperature ? Number(temperature) : undefined,
          notes: `${transportNotes}. Pickup: ${pickupTime}, Drop: ${dropTime}`,
        };
      } else if (eventType === 'SALE') {
        eventPayload = {
          ...eventPayload,
          weight_kg: Number(saleWeight),
          price_per_kg: Number(salePricePerKg),
          customer_type: customerType,
          location: saleLocation,
          notes: saleNotes,
        };
      }

      const res = await api.addEvent(batchId, eventPayload, user);

      if (res.triggeredAlerts && res.triggeredAlerts.length > 0) {
        toast((tAlert) => (
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-xs">Event saved with system alert!</p>
              <p className="text-[11px] text-slate-600">{res.triggeredAlerts[0].description}</p>
            </div>
          </div>
        ), { duration: 6000 });
      } else {
        toast.success(`Event logged into hash chain!`);
      }

      navigate(`/batches/${batchId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to record event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Page Header */}
        <PageHeader
          title={
            eventType === 'PURCHASE'
              ? `${t('addEvent.eventPurchase')} (${t('roles.trader')})`
              : eventType === 'PROCESSING'
              ? `${t('addEvent.eventProcessing')} (${t('roles.processor')})`
              : eventType === 'TRANSPORT'
              ? `${t('addEvent.eventTransport')} (${t('roles.transporter')})`
              : `${t('addEvent.eventSale')} (${t('roles.seller')})`
          }
          subtitle={t('addEvent.subtitle')}
        />

        {/* Role Selector Tabs (Visible if Admin or testing) */}
        {user?.role === 'ADMIN' && (
          <div className="bg-white p-2 rounded-2xl border border-borderLight shadow-xs mb-6 flex flex-wrap gap-2">
            <span className="text-xs font-bold text-textSecondary px-2 py-1 flex items-center">
              {t('addEvent.selectEvent')}:
            </span>
            {[
              { type: 'PURCHASE', label: `1. ${t('addEvent.eventPurchase')}`, icon: ShoppingBag },
              { type: 'PROCESSING', label: `2. ${t('addEvent.eventProcessing')}`, icon: Cpu },
              { type: 'TRANSPORT', label: `3. ${t('addEvent.eventTransport')}`, icon: Truck },
              { type: 'SALE', label: `4. ${t('addEvent.eventSale')}`, icon: Store },
            ].map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setEventType(tab.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  eventType === tab.type
                    ? 'bg-ocean-600 text-white shadow-xs'
                    : 'bg-slate-50 text-textSecondary hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Event Form Card matching reference mockups #2, #3, #4, #5 */}
        <div className="bg-white rounded-ct p-4 sm:p-6 md:p-8 border border-borderLight shadow-card">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Batch ID Selector with Scan QR button */}
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">
                {t('batches.batchId')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                  placeholder="e.g. FB-20261028-0001"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-borderLight text-xs font-mono font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t('actions.scanQr')}</span>
                </button>
              </div>

              {/* Batch Info Card Indicator */}
              {currentBatch ? (
                <div className="mt-2.5 p-3 rounded-xl bg-ocean-50/70 border border-ocean-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-navy-900">{currentBatch.species}</span>
                    <span className="text-textSecondary">• {currentBatch.landing_centre}</span>
                    <span className="font-semibold text-ocean-700">({currentBatch.current_weight_kg} kg current)</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentBatch.status === 'SOLD' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentBatch.status}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-textSecondary">
                  Enter a valid batch or scan the QR code on the fish crate.
                </p>
              )}

              {/* Counterparty Trust Score Banner */}
              {counterparty && (
                <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-ocean-50/80 to-slate-50 border border-ocean-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      counterparty.trustScore >= 90 ? 'bg-emerald-600' : counterparty.trustScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">
                        You are transacting with <span className="text-ocean-700 font-extrabold">{counterparty.name}</span>
                        {counterparty.org ? ` (${counterparty.org})` : ''}
                      </p>
                      <p className="text-[11px] text-textSecondary mt-0.5">
                        Verified handovers: <span className="font-semibold text-emerald-700">{counterparty.confirmedCount} confirmed</span> • <span className="font-semibold text-rose-600">{counterparty.disputedCount} disputed</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-textSecondary">Trust Score</span>
                    <span className={`text-sm font-black ${
                      counterparty.trustScore >= 90 ? 'text-emerald-600' : counterparty.trustScore >= 70 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {counterparty.trustScore}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* FORM TYPE 1: TRADER (Record Purchase) matching mockup #2 */}
            {eventType === 'PURCHASE' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Weight Purchased (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={purchaseWeight}
                      onChange={(e) => setPurchaseWeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Price per kg (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={purchasePricePerKg}
                      onChange={(e) => setPurchasePricePerKg(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase mb-1.5">
                      Total Price (₹)
                    </label>
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ocean-700 font-mono">
                      ₹{purchaseTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Buyer / Next Handler
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Coastal Foods Pvt Ltd"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Purchase Location
                    </label>
                    <input
                      type="text"
                      value={purchaseLocation}
                      onChange={(e) => setPurchaseLocation(e.target.value)}
                      placeholder="e.g. Mangaluru Harbour Auction Yard"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                    placeholder="e.g. Auction lot, quality grade A..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>
            )}

            {/* FORM TYPE 2: PROCESSOR (Record Processing) matching mockup #3 */}
            {eventType === 'PROCESSING' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Input Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Output Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={outputWeight}
                      onChange={(e) => setOutputWeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  {/* Calculated Yield % Badge matching reference mockup #3 */}
                  <div className="text-center sm:text-right">
                    <span className="text-xs font-bold text-textSecondary uppercase block mb-1">
                      Calculated Yield
                    </span>
                    <span
                      className={`inline-block text-2xl font-black px-3 py-1 rounded-xl font-mono ${
                        Number(yieldPercent) < 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {yieldPercent}%
                    </span>
                  </div>
                </div>

                {/* Warning if excessive weight loss */}
                {Number(yieldPercent) > 0 && Number(yieldPercent) < 40 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Warning: Processing weight loss exceeds 60%. An anomaly flag will be logged.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Process Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={processType}
                      onChange={(e) => setProcessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
                      required
                    >
                      <option value="Cleaning & Packing">Cleaning & Packing</option>
                      <option value="Filleting & Blast Freezing">Filleting & Blast Freezing</option>
                      <option value="IQF Prawn Deveining">IQF Prawn Deveining</option>
                      <option value="Canning">Canning</option>
                      <option value="Sun-drying & Salting">Sun-drying & Salting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Processing Facility Location
                    </label>
                    <input
                      type="text"
                      value={processLocation}
                      onChange={(e) => setProcessLocation(e.target.value)}
                      placeholder="e.g. Baikampady Industrial Estate"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={processNotes}
                    onChange={(e) => setProcessNotes(e.target.value)}
                    placeholder="e.g. Cleaned, packed, vacuum sealed..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>
            )}

            {/* FORM TYPE 3: TRANSPORTER (Record Transport) matching mockup #4 */}
            {eventType === 'TRANSPORT' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Mangaluru Harbour"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Drop Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      placeholder="e.g. Bengaluru Wholesale Market"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Drop Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={dropTime}
                      onChange={(e) => setDropTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Temperature (°C) during Transit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="e.g. 4.0"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                    <Thermometer className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {Number(temperature) > 4 && (
                    <p className="text-[11px] text-amber-600 mt-1 font-semibold">
                      ⚠️ Cold chain alert: Temperature exceeds recommended 4°C chilled fish threshold.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={transportNotes}
                    onChange={(e) => setTransportNotes(e.target.value)}
                    placeholder="e.g. Refrigerated van KA-19-B-8821, route temp monitored..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>
            )}

            {/* FORM TYPE 4: SELLER (Record Sale) matching mockup #5 */}
            {eventType === 'SALE' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Weight Sold (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={saleWeight}
                      onChange={(e) => setSaleWeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Price per kg (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={salePricePerKg}
                      onChange={(e) => setSalePricePerKg(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase mb-1.5">
                      Total Sale Price (₹)
                    </label>
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ocean-700 font-mono">
                      ₹{saleTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Customer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
                      required
                    >
                      <option value="Retailer / Supermarket">Retailer / Supermarket</option>
                      <option value="Direct Consumer Retail">Direct Consumer Retail</option>
                      <option value="Seafood Restaurant">Seafood Restaurant</option>
                      <option value="Institutional Buyer">Institutional Buyer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Sale Location
                    </label>
                    <input
                      type="text"
                      value={saleLocation}
                      onChange={(e) => setSaleLocation(e.target.value)}
                      placeholder="e.g. Bengaluru Wholesale Fish Market"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
                    placeholder="e.g. Final retail counter batch handover..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
                  <div className="flex items-center gap-2 font-bold mb-0.5">
                    <ShieldCheck className="w-4 h-4 text-sky-700" />
                    <span>Final Lifecycle Transition</span>
                  </div>
                  Recording a SALE event will mark the batch status as <strong>SOLD</strong> and complete the supply-chain journey.
                </div>
              </div>
            )}

            {/* Universal Grade Claimed Selection */}
            <div className="pt-2 border-t border-borderLight">
              <label className="block text-xs font-bold text-navy-900 mb-1.5">
                Handover Quality Grade Claimed <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { grade: 'A', title: 'Grade A (Prime)', desc: 'Optimal export/sashimi quality, pristine cold chain' },
                  { grade: 'B', title: 'Grade B (Standard)', desc: 'Commercial wholesale grade, slight temp/color variance' },
                  { grade: 'C', title: 'Grade C (Utility)', desc: 'Industrial processing grade, minor sensory defects' },
                ].map((g) => (
                  <button
                    key={g.grade}
                    type="button"
                    onClick={() => setGradeClaimed(g.grade)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      gradeClaimed === g.grade
                        ? 'border-ocean-600 bg-ocean-50 text-ocean-900 ring-2 ring-ocean-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{g.title}</span>
                      {gradeClaimed === g.grade && <CheckCircle className="w-3.5 h-3.5 text-ocean-600" />}
                    </div>
                    <span className="text-[10px] text-textSecondary block mt-1">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-borderLight flex items-center justify-between">
              <span className="text-xs text-textSecondary">
                Actor: <strong>{user?.name}</strong> ({user?.org})
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-ocean-600 hover:bg-ocean-700 shadow-md hover:shadow-hover transition-all flex items-center gap-2"
              >
                <span>
                  {submitting ? t('actions.committing') : t('actions.commitEvent')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(scannedId) => {
          setBatchId(scannedId);
          toast.success(`Selected batch ${scannedId}`);
        }}
      />

      <Footer />
    </div>
  );
}
