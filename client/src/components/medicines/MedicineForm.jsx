import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Pill,
  Plus,
  Trash,
  Upload,
  Calendar,
  Clock,
  User,
  Utensils,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';

const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  description: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required (e.g. 500mg, 1 tablet)'),
  medicineType: z.enum(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops']),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  foodTiming: z.enum(['Before Food', 'After Food', 'With Food', 'No Restriction']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  doctorName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
  status: z.enum(['Active', 'Completed', 'Paused']).default('Active'),
});

const MedicineForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [reminderTimes, setReminderTimes] = useState(
    initialData?.reminderTimes || ['08:00', '20:00']
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [newTimeInput, setNewTimeInput] = useState('');

  const formattedInitialData = initialData
    ? {
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      }
    : {
        medicineType: 'Tablet',
        foodTiming: 'After Food',
        category: 'General',
        quantity: 30,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: formattedInitialData,
  });

  const handleAddReminderTime = () => {
    if (newTimeInput && !reminderTimes.includes(newTimeInput)) {
      setReminderTimes([...reminderTimes, newTimeInput].sort());
      setNewTimeInput('');
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    if (reminderTimes.length <= 1) {
      alert('At least one reminder time is required');
      return;
    }
    setReminderTimes(reminderTimes.filter((t) => t !== timeToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    formData.append('reminderTimes', JSON.stringify(reminderTimes));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-brand-500" />
            <span>Basic Prescription Details</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Specify medicine name, dosage unit, category and administration instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Medicine Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Amoxicillin, Metformin"
              {...register('name')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Dosage Strength *
            </label>
            <input
              type="text"
              placeholder="e.g. 500mg, 10ml, 1 pill"
              {...register('dosage')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.dosage && <p className="text-xs text-rose-500 mt-1">{errors.dosage.message}</p>}
          </div>

          {/* Medicine Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pharmaceutical Form *
            </label>
            <select
              {...register('medicineType')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Drops">Drops</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pills / Dose Count in Stock *
            </label>
            <input
              type="number"
              min="1"
              {...register('quantity')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity.message}</p>}
          </div>

          {/* Food Timing */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Food Intake Timing *
            </label>
            <select
              {...register('foodTiming')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Before Food">Before Food</option>
              <option value="After Food">After Food</option>
              <option value="With Food">With Food</option>
              <option value="No Restriction">No Restriction</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category *
            </label>
            <input
              type="text"
              placeholder="e.g. Antibiotics, Allergy, Cardiac, General"
              {...register('category')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Description / Instructions
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Take with a full glass of water, do not crush tablet."
            {...register('description')}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>

      {/* Section 2: Reminders & Schedule */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            <span>Reminder Timing & Course Duration</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Set multiple daily alarm slots and prescribe course start & end dates.
          </p>
        </div>

        {/* Daily Reminder Slots Picker */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Daily Alarm Times (HH:mm)
          </label>

          <div className="flex items-center gap-3">
            <input
              type="time"
              value={newTimeInput}
              onChange={(e) => setNewTimeInput(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddReminderTime}
              className="inline-flex items-center space-x-1 px-4 py-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 font-semibold text-xs hover:bg-brand-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {reminderTimes.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700"
              >
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTime(t)}
                  className="text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Start & End Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.startDate && <p className="text-xs text-rose-500 mt-1">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              End Date *
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate.message}</p>}
          </div>
        </div>
      </div>

      {/* Section 3: Prescribing Doctor, Photo & Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <span>Prescribing Doctor & Uploads</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Doctor Name
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Sarah Jenkins"
              {...register('doctorName')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Medicine Image Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Medicine Box / Bottle Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Click to upload medicine photo
              </span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {imagePreview && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Personal Medical Notes
          </label>
          <textarea
            rows="2"
            placeholder="Special instructions or precautions..."
            {...register('notes')}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isSubmitting ? 'Saving Prescription...' : 'Save Medicine Record'}</span>
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;
