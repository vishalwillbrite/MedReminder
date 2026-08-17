import React from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Clock,
  User,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Utensils,
  Tag,
} from 'lucide-react';

const MedicineCard = ({ medicine, onDelete }) => {
  const isCompleted = medicine.status === 'Completed';

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-800 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Card Header & Image */}
      <div>
        {medicine.image ? (
          <div className="h-40 w-full overflow-hidden relative">
            <img
              src={medicine.image}
              alt={medicine.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                {medicine.category || 'General'}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isCompleted ? 'bg-emerald-500/80' : 'bg-brand-500/80'
                }`}
              >
                {medicine.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-200/60 dark:border-brand-800/60">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  {medicine.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {medicine.dosage} • {medicine.medicineType}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
              }`}
            >
              {medicine.status}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {medicine.image && (
            <div className="mb-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                {medicine.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {medicine.dosage} • {medicine.medicineType}
              </p>
            </div>
          )}

          {medicine.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {medicine.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
              <Utensils className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate">{medicine.foodTiming}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
              <Tag className="w-3.5 h-3.5 text-teal-500" />
              <span className="truncate">Qty: {medicine.quantity} left</span>
            </div>
          </div>

          {/* Reminder Times Pills */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Scheduled Daily Times:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {medicine.reminderTimes?.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50"
                >
                  <Clock className="w-3 h-3" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Doctor name & Date Range */}
          <div className="pt-2 text-xs space-y-1 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
            {medicine.doctorName && (
              <div className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Dr. {medicine.doctorName}</span>
              </div>
            )}
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {new Date(medicine.startDate).toLocaleDateString()} -{' '}
                {new Date(medicine.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <Link
          to={`/edit-medicine/${medicine._id}`}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition"
        >
          <Edit2 className="w-3.5 h-3.5 text-brand-500" />
          <span>Edit</span>
        </Link>

        <button
          onClick={() => onDelete(medicine._id, medicine.name)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;
