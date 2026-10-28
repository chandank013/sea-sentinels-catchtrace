import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import BatchTable from '../components/batches/BatchTable';
import QRCodeCard from '../components/qr/QRCodeCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Boxes,
  X,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Batches() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scope: 'my' for user's specific data, 'all' for all supply chain batches
  const [scope, setScope] = useState(user?.role === 'ADMIN' ? 'all' : 'my');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [landingCentreFilter, setLandingCentreFilter] = useState('ALL');

  // Selected batch for QR Modal
  const [selectedBatchQR, setSelectedBatchQR] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await api.getBatches({
        user,
        scope,
        q: searchQuery,
        species: speciesFilter,
        status: statusFilter,
        landing_centre: landingCentreFilter,
      });
      setBatches(data);
    } catch (err) {
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [user, scope, searchQuery, speciesFilter, statusFilter, landingCentreFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSpeciesFilter('ALL');
    setStatusFilter('ALL');
    setLandingCentreFilter('ALL');
    toast.success('Filters reset');
  };

  const canCreateBatch = user?.role === 'FISHER' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Page Header */}
        <PageHeader
          title={t('batches.title')}
          subtitle={t('batches.subtitle')}
        >
          <button
            onClick={() => api.exportCsv()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-borderLight bg-white hover:bg-slate-50 text-navy-900 font-semibold text-xs transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-ocean-600" />
            <span>{t('actions.exportCsv')}</span>
          </button>

          {canCreateBatch && (
            <NavLink
              to="/batches/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('batches.createNewBatch')}</span>
            </NavLink>
          )}
        </PageHeader>

        {/* Role Scoping Indicator */}
        {user?.role !== 'ADMIN' ? (
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-ocean-50 text-ocean-800 text-xs font-semibold rounded-xl border border-ocean-200">
            <span>{t('batches.scopeUser')} {user?.name} ({user?.org || t(`roles.${(user?.role||'admin').toLowerCase()}`, user?.roleLabel)})</span>
          </div>
        ) : (
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-navy-900 text-white text-xs font-bold rounded-xl shadow-xs">
            <span>{t('batches.scopeAdmin')}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-ct p-4 border border-borderLight shadow-subtle mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('batches.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            {/* Species Filter */}
            <div>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white cursor-pointer"
              >
                <option value="ALL">{t('species.all')}</option>
                <option value="Mackerel">{t('species.Mackerel')}</option>
                <option value="Sardine">{t('species.Sardine')}</option>
                <option value="Pomfret">{t('species.Pomfret')}</option>
                <option value="Tuna">{t('species.Tuna')}</option>
                <option value="Prawns">{t('species.Prawns')}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white cursor-pointer"
              >
                <option value="ALL">{t('status.all')}</option>
                <option value="ACTIVE">{t('status.active')}</option>
                <option value="SOLD">{t('status.sold')}</option>
                <option value="FLAGGED">{t('status.flagged')}</option>
              </select>
            </div>

            {/* Landing Centre Filter */}
            <div>
              <select
                value={landingCentreFilter}
                onChange={(e) => setLandingCentreFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-borderLight text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white cursor-pointer"
              >
                <option value="ALL">{t('harbours.all')}</option>
                <option value="Mangaluru Harbour">{t('harbours.Mangaluru Harbour')}</option>
                <option value="Malpe Harbour">{t('harbours.Malpe Harbour')}</option>
                <option value="Karwar Harbour">{t('harbours.Karwar Harbour')}</option>
              </select>
            </div>

          </div>

          {/* Active Filter Indicators & Reset */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-textSecondary">
            <span>
              Showing <strong>{batches.length}</strong> batches
            </span>

            {(searchQuery || speciesFilter !== 'ALL' || statusFilter !== 'ALL' || landingCentreFilter !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-ocean-600 hover:text-ocean-700 font-semibold hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('batches.resetFilters')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Batch Table Component */}
        <BatchTable
          batches={batches}
          onOpenQR={(b) => setSelectedBatchQR(b)}
        />

      </main>

      {/* QR Code Modal when user clicks QR icon in table */}
      {selectedBatchQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-sm w-full">
            <button
              onClick={() => setSelectedBatchQR(null)}
              className="absolute -top-3 -right-3 z-10 p-1.5 bg-white rounded-full shadow-md text-textSecondary hover:text-navy-900"
            >
              <X className="w-5 h-5" />
            </button>
            <QRCodeCard
              batchId={selectedBatchQR.batch_id}
              species={selectedBatchQR.species}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
