import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicineByIdApi, updateMedicineApi } from '../services/medicineService';
import { toast } from 'react-hot-toast';
import { Edit3, ArrowLeft } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import MedicineForm from '../components/medicines/MedicineForm';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const data = await getMedicineByIdApi(id);
        setMedicine(data);
      } catch (err) {
        toast.error('Failed to load medicine details');
        navigate('/medicines');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id, navigate]);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateMedicineApi(id, formData);
      toast.success('Prescription updated successfully!');
      navigate('/medicines');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/medicines')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-7 h-7 text-brand-500" />
                <span>Edit Prescription</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Update dosage, alarm slots, duration, or prescribing doctor notes.
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : medicine ? (
            <MedicineForm initialData={medicine} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          ) : null}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default EditMedicine;
