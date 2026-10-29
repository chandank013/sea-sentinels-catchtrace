import React, { useState, useRef } from 'react';
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
  Camera,
  ShieldCheck,
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

  // Live Camera Photo Evidence State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState(null);

  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setUploadingPhoto(true);
      try {
        const cloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET;

        let finalUrl = '';
        if (cloudName && uploadPreset) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: formData,
            });
            const cData = await cRes.json();
            if (cData.secure_url) {
              finalUrl = cData.secure_url;
            }
          } catch (cErr) {
            console.warn('Cloudinary upload fallback:', cErr);
          }
        }

        if (!finalUrl) {
          const res = await api.uploadPhoto(dataUrl, file.name);
          finalUrl = res.url || dataUrl;
        }

        setPhotoUrl(finalUrl);
        toast.success('Landing evidence captured & ready to hash!');
      } catch (err) {
        console.warn('Upload fallback to local Data URL:', err);
        setPhotoUrl(dataUrl);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetakePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!species || !landingCentre || !initialWeight || Number(initialWeight) <= 0) {
      toast.error('Please enter valid species, harbour, and initial weight');
      return;
    }

    if (!photoFile && !photoUrl) {
      toast.error('Live camera photo evidence of landed catch is required!');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
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
        photo_url: photoUrl,
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
          <div className="lg:col-span-7 bg-white rounded-ct p-4 sm:p-6 md:p-8 border border-borderLight shadow-subtle">
            
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

              {/* Live Camera Photo Evidence — Required for Catch Landing */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-navy-900">
                    Live Catch Landing Photo <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded-full border border-ocean-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-ocean-600" />
                    <span>Genesis Hash Locked</span>
                  </span>
                </div>

                <p className="text-[11px] text-textSecondary">
                  Take a live camera photo of the landed catch at harbour weigh-in. This photo evidence is hashed into Genesis Block #1.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                  className="hidden"
                  id="landing-camera-photo-input"
                />

                {!photoPreview ? (
                  <label
                    htmlFor="landing-camera-photo-input"
                    className="w-full flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-ocean-300 hover:border-ocean-500 bg-ocean-50/20 hover:bg-ocean-50/50 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-ocean-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform mb-1.5">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-navy-900 group-hover:text-ocean-700 transition-colors">
                      Take Live Landing Photo with Camera
                    </span>
                    <span className="text-[10px] text-textMuted mt-0.5">
                      Rear camera on mobile (capture="environment")
                    </span>
                  </label>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Landed catch evidence preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-300 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-navy-900">Landing Photo Captured</span>
                        </div>
                        <p className="text-[10px] text-textMuted mt-0.5 font-mono truncate max-w-[200px] sm:max-w-[300px]">
                          {photoFile?.name || 'landing_camera_capture.jpg'}
                        </p>
                        {uploadingPhoto ? (
                          <span className="text-[10px] text-ocean-700 font-semibold animate-pulse block mt-0.5">
                            Uploading to secure storage...
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                            ✓ Ready for Genesis block
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="self-end sm:self-auto text-xs font-bold text-ocean-700 hover:text-ocean-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
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
