import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import QRCodeCard from '../components/qr/QRCodeCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Anchor,
  Scale,
  Calendar,
  Ship,
  User,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function NewBatch() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form State matching reference mockup #1
  const [species, setSpecies] = useState('Mackerel');
  const [landingCentre, setLandingCentre] = useState('Mangaluru Harbour');
  const [landedAt, setLandedAt] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [initialWeight, setInitialWeight] = useState('250');
  const [boatName, setBoatName] = useState('Sea Queen');
  const [operatorName, setOperatorName] = useState(user?.name || 'Ramesh Naik');
  const [notes, setNotes] = useState('Grade A ocean catch, ice-stored in forward hold');

  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!species || !landingCentre || !initialWeight || Number(initialWeight) <= 0) {
      toast.error('Please enter valid species, harbour, and initial weight');
      return;
    }

    setLoading(true);
    try {
      const newBatch = await api.createBatch({
        species,
        landing_centre: landingCentre,
        landed_at: new Date(landedAt).toISOString(),
        initial_weight_kg: Number(initialWeight),
        boat_name: boatName,
        operator_name: operatorName,
        user_id: user?.id,
        user_email: user?.email,
        notes,
      });

      setCreatedBatch(newBatch);
      toast.success(`Batch ${newBatch.batch_id} created successfully!`);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err) {
      toast.error(err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Page Header */}
        <PageHeader
          title={t('newBatch.title')}
          subtitle={t('newBatch.subtitle')}
        >
          <NavLink
            to="/batches"
            className="px-4 py-2 rounded-xl border border-borderLight bg-white hover:bg-slate-50 text-navy-900 font-semibold text-xs transition-colors"
          >
            {t('newBatch.backToBatches')}
          </NavLink>
        </PageHeader>

        {/* 2-Column Responsive Form & QR Preview matching mockup #1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Landing Entry Form */}
          <div className="lg:col-span-7 bg-white rounded-ct p-6 sm:p-8 border border-borderLight shadow-subtle">
            
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-borderLight">
              <div className="w-10 h-10 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">{t('newBatch.landingDetails')}</h3>
                <p className="text-xs text-textSecondary">{t('newBatch.landingDetailsSub')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Species Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    {t('newBatch.fishSpecies')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
                    required
                  >
                    <option value="Mackerel">{t('species.Mackerel')}</option>
                    <option value="Sardine">{t('species.Sardine')}</option>
                    <option value="Pomfret">{t('species.Pomfret')}</option>
                    <option value="Tuna">{t('species.Tuna')}</option>
                    <option value="Prawns">{t('species.Prawns')}</option>
                  </select>
                </div>

                {/* Landing Centre */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    {t('newBatch.landingCentre')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={landingCentre}
                    onChange={(e) => setLandingCentre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
                    required
                  >
                    <option value="Mangaluru Harbour">{t('harbours.Mangaluru Harbour')}</option>
                    <option value="Malpe Harbour">{t('harbours.Malpe Harbour')}</option>
                    <option value="Karwar Harbour">{t('harbours.Karwar Harbour')}</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Landing Date and Time */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    {t('newBatch.landingDateTime')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={landedAt}
                      onChange={(e) => setLandedAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                  </div>
                </div>

                {/* Initial Weight in kg */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    {t('newBatch.initialWeightKg')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={initialWeight}
                      onChange={(e) => setInitialWeight(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderLight text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      required
                    />
                    <Scale className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Boat Name */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    {t('newBatch.boatName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={boatName}
                      onChange={(e) => setBoatName(e.target.value)}
                      placeholder="e.g. Sea Queen"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                    <Ship className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Fisher / Landing Operator */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    {t('newBatch.operatorName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="e.g. Ramesh Naik"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                    <User className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  {t('newBatch.landingNotes')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('newBatch.notesPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-ocean-600 hover:bg-ocean-700 shadow-md hover:shadow-hover transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? t('actions.creatingBatch') : t('actions.createBatchBtn')}</span>
                </button>
              </div>

            </form>

          </div>

          {/* Right Column: QR Code Preview Card matching reference mockup */}
          <div className="lg:col-span-5 space-y-4">
            {createdBatch ? (
              <div className="space-y-4 animate-fade-in">
                <QRCodeCard
                  batchId={createdBatch.batch_id}
                  species={createdBatch.species}
                  isNew={true}
                />
                
                <div className="bg-white rounded-ct p-4 border border-borderLight text-center">
                  <NavLink
                    to={`/batches/${createdBatch.batch_id}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-ocean-600 hover:text-ocean-700 hover:underline"
                  >
                    <span>{t('actions.viewDetails')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </NavLink>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-ct p-8 border-2 border-dashed border-borderLight text-center text-textSecondary">
                <div className="w-16 h-16 rounded-2xl bg-ocean-50 text-ocean-600 mx-auto mb-3 flex items-center justify-center">
                  <Anchor className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-navy-900 mb-1">{t('newBatch.qrPreviewTitle')}</h4>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">
                  {t('newBatch.qrPreviewSub')}
                </p>
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
