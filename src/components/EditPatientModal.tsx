import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, MapPin, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientUpdated: () => void;
  patient: {
    id: string;
    name: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    phone?: string;
    email?: string;
    address?: string;
    gender?: string;
    primary_pathology?: string;
    status?: string;
    notes?: string;
    emergency_contact?: string;
  };
}

interface FormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  primary_pathology: string;
  status: string;
  notes: string;
  emergency_contact: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
}

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'in_treatment', label: 'En traitement' },
  { value: 'recovered', label: 'Guéri' }
];

const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, onPatientUpdated, patient }) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    address: '',
    gender: '',
    primary_pathology: '',
    status: 'active',
    notes: '',
    emergency_contact: ''
  });

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && patient) {
      const nameParts = patient.name.split(' ');
      setFormData({
        first_name: patient.first_name || nameParts[0] || '',
        last_name: patient.last_name || nameParts.slice(1).join(' ') || '',
        date_of_birth: patient.date_of_birth || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        gender: patient.gender || '',
        primary_pathology: patient.primary_pathology || '',
        status: patient.status || 'active',
        notes: patient.notes || '',
        emergency_contact: patient.emergency_contact || ''
      });
      setFieldErrors({});
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom est requis';
    }

    if (!formData.date_of_birth) {
      errors.date_of_birth = 'La date de naissance est requise';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (birthDate > today) {
        errors.date_of_birth = 'La date de naissance ne peut pas être dans le futur';
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    } else if (formData.phone.trim().length < 10) {
      errors.phone = 'Le numéro de téléphone doit contenir au moins 10 chiffres';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email invalide';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const allowedStatuses = ['active', 'inactive', 'in_treatment', 'recovered'];
    if (!allowedStatuses.includes(formData.status)) {
      setError(`Statut invalide: "${formData.status}". Les valeurs autorisées sont: active, inactive, in_treatment, recovered.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

      const { error: updateError } = await supabase
        .from('patients')
        .update({
          name: fullName,
          email: formData.email.trim(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          date_of_birth: formData.date_of_birth,
          phone: formData.phone.trim(),
          address: formData.address.trim() || null,
          gender: formData.gender || null,
          primary_pathology: formData.primary_pathology.trim() || null,
          status: formData.status,
          notes: formData.notes.trim() || null,
          emergency_contact: formData.emergency_contact.trim() || null
        })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      setSuccess(true);

      setTimeout(() => {
        onPatientUpdated();
        onClose();
        setSuccess(false);
      }, 800);

    } catch (err: any) {
      logger.error('Error updating patient:', err);

      let errorMessage = 'Erreur lors de la modification du patient.';

      if (err.message?.includes('unique constraint')) {
        errorMessage = 'Un patient avec cet email ou téléphone existe déjà.';
      } else if (err.message?.includes('patients_status_check') || err.message?.includes('check constraint')) {
        errorMessage = 'Statut invalide. Les valeurs autorisées sont: Actif, Inactif, En traitement, Guéri.';
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#334155] w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between border-b border-[#334155] z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Modifier Patient</h2>
              <p className="text-emerald-100 text-xs sm:text-sm hidden sm:block">Mettre à jour les informations du patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            disabled={loading}
          >
            <X size={22} className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-400 text-sm">Patient modifié avec succès!</p>
            </div>
          )}

          <div className="bg-[#1e293b]/50 rounded-xl p-3 sm:p-5 border border-[#334155]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-emerald-400" />
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.first_name ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                  }`}
                  placeholder="Jean"
                />
                {fieldErrors.first_name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.last_name ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                  }`}
                  placeholder="Dupont"
                />
                {fieldErrors.last_name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="date_of_birth" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-400" />
                  Date de Naissance <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.date_of_birth ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                  }`}
                />
                {fieldErrors.date_of_birth && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.date_of_birth}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-green-400" />
                  Téléphone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                  }`}
                  placeholder="4186225656"
                />
                {fieldErrors.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="gender" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <User size={16} className="text-indigo-400" />
                    Genre
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Non renseigné</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="child">Enfant</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b]/50 rounded-xl p-3 sm:p-5 border border-[#334155]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail size={18} className="text-cyan-400" />
              Contact et adresse
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-cyan-400" />
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                  }`}
                  placeholder="jean.dupont@email.com"
                />
                {fieldErrors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-purple-400" />
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="123 Rue Principale, Ville"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b]/50 rounded-xl p-3 sm:p-5 border border-[#334155]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-orange-400" />
              Informations médicales
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary_pathology" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Activity size={16} className="text-orange-400" />
                    Pathologie Principale
                  </label>
                  <input
                    type="text"
                    id="primary_pathology"
                    name="primary_pathology"
                    value={formData.primary_pathology}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: Diabète, Hypertension..."
                  />
                </div>

                <div>
                  <label htmlFor="status" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Activity size={16} className="text-green-400" />
                    Statut <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact d'urgence
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Nom et numéro du contact d'urgence"
                  className="w-full px-4 py-3 bg-[#1e293b] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={loading}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Notes médicales, historique, observations..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-medium text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg font-medium text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Modification...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={18} />
                  Modifié!
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
