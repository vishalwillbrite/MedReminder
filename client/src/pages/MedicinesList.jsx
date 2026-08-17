import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMedicinesApi, deleteMedicineApi } from '../services/medicineService';
import { toast } from 'react-hot-toast';
import { Pill, PlusCircle, Printer } from 'lucide-react';
import { printMedicationSchedulePDF } from '../utils/exportUtils';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import MedicineCard from '../components/medicines/MedicineCard';
import MedicineFilter from '../components/medicines/MedicineFilter';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const MedicinesList = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All');

  // Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMedToDelete, setSelectedMedToDelete] = useState(null);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicinesApi({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        timeFilter: selectedTimeFilter,
      });
      setMedicines(data);
    } catch (err) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [searchQuery, selectedCategory, selectedStatus, selectedTimeFilter]);

  const handleDeleteClick = (id, name) => {
    setSelectedMedToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedToDelete) return;
    try {
      await deleteMedicineApi(selectedMedToDelete.id);
      toast.success(`Deleted ${selectedMedToDelete.name}`);
      setDeleteModalOpen(false);
      setSelectedMedToDelete(null);
      loadMedicines();
    } catch (err) {
      toast.error('Failed to delete medicine');
    }
  };

  const categories = Array.from(new Set(medicines.map((m) => m.category).filter(Boolean)));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-7 h-7 text-sky-500" />
                <span>My Prescriptions & Medicines</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage all your active and past medical treatment courses.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => printMedicationSchedulePDF(medicines)}
                className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-xs hover:bg-slate-50 transition"
              >
                <Printer className="w-4 h-4 text-sky-500" />
                <span>Print Schedule</span>
              </button>

              <Link
                to="/add-medicine"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add New Medicine</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <MedicineFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedTimeFilter={selectedTimeFilter}
            onTimeFilterChange={setSelectedTimeFilter}
            categories={categories}
          />

          {/* Grid list or Loading or Empty */}
          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : medicines.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No Medicines Found"
              description="No prescription records matched your query or filter parameters."
              actionLink="/add-medicine"
              actionText="Add Medicine Now"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((med) => (
                <MedicineCard key={med._id} medicine={med} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Medicine Record"
        message={`Are you sure you want to permanently remove "${selectedMedToDelete?.name}"? All associated reminder logs will also be deleted.`}
        confirmText="Delete Medicine"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default MedicinesList;
