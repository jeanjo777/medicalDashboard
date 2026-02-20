/**
 * AddPatientModal Component
 *
 * Complete modal form for adding new patients to the system.
 * Includes full validation, error handling, loading states, and Supabase integration.
 *
 * @features
 * - 9 form fields (4 required, 5 optional)
 * - HTML5 validation (tel, email, date types)
 * - Real-time error messages
 * - Loading spinner during submission
 * - Disabled state with opacity during processing
 * - Auto-close and table refresh on success
 * - Click outside or ESC to close
 * - Responsive grid layout (1 col mobile, 2 cols desktop)
 * - Supabase database integration
 * - Accessibility compliant (ARIA, labels, roles)
 *
 * @required_fields
 * - Prénom (first_name)
 * - Nom (last_name)
 * - Date de naissance (date_of_birth)
 * - Téléphone (phone)
 * - Statut (status) - default: "Actif"
 *
 * @optional_fields
 * - Email (email)
 * - Adresse (address)
 * - Pathologie principale (primary_pathology)
 * - Notes (notes)
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, User, Calendar, Activity, FileText, Phone, Mail, MapPin, AlertCircle, CheckCircle, Heart, Thermometer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  name?: string;
}

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'in_treatment', label: 'En traitement' },
  { value: 'recovered', label: 'Guéri' }
];

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onPatientAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    address: '',
    gender: '' as string,
    primary_pathology: '',
    status: 'active' as 'active' | 'in_treatment' | 'recovered' | 'inactive',
    notes: '',
    emergency_contact: '',
    temperature: '',
    poids: '',
    taille: '',
    tension_arterielle: '',
    test_palu: '',
    glycemie: '',
    pouls: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && e.target instanceof Node && !modalRef.current.contains(e.target) && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, loading]);

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

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email invalide';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

      const { error: insertError } = await supabase
        .from('patients')
        .insert([
          {
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
            emergency_contact: formData.emergency_contact.trim() || null,
            temperature: formData.temperature ? parseFloat(formData.temperature) : null,
            poids: formData.poids ? parseFloat(formData.poids) : null,
            taille: formData.taille ? parseFloat(formData.taille) : null,
            tension_arterielle: formData.tension_arterielle.trim() || null,
            test_palu: formData.test_palu || null,
            glycemie: formData.glycemie ? parseFloat(formData.glycemie) : null,
            pouls: formData.pouls ? parseInt(formData.pouls) : null
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);

      setFormData({
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
        emergency_contact: '',
        temperature: '',
        poids: '',
        taille: '',
        tension_arterielle: '',
        test_palu: '',
        glycemie: '',
        pouls: ''
      });
      setFieldErrors({});

      setTimeout(() => {
        onPatientAdded();
        onClose();
        setSuccess(false);
      }, 800);

    } catch (err: any) {
      logger.error('Error adding patient:', err);

      let errorMessage = 'Erreur lors de l\'ajout du patient.';

      if (err.message?.includes('not-null constraint')) {
        errorMessage = 'Un champ obligatoire est manquant. Veuillez vérifier que tous les champs requis sont remplis.';
      } else if (err.message?.includes('row-level security')) {
        errorMessage = 'Erreur de permissions. Veuillez vous assurer que vous êtes autorisé à ajouter des patients.';
      } else if (err.message?.includes('unique constraint')) {
        errorMessage = 'Un patient avec cet email ou téléphone existe déjà.';
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
        ref={modalRef}
        className="relative bg-[#1e293b] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden border border-[#334155] animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <User size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="modal-title" className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Nouveau Patient</h2>
              <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Ajouter un nouveau patient au système</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Fermer la modale"
          >
            <X size={18} className="text-white sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-80px)] sm:max-h-[calc(90vh-100px)]">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200" role="alert" aria-live="assertive">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Erreur</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200" role="status" aria-live="polite">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-medium">Succès</p>
                  <p className="text-emerald-300 text-sm mt-1">Le patient a été ajouté avec succès!</p>
                </div>
              </div>
            )}

            <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-3 sm:p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-400" />
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.first_name ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                    }`}
                    placeholder="Jean"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.first_name}
                    aria-describedby={fieldErrors.first_name ? 'first_name-error' : undefined}
                  />
                  {fieldErrors.first_name && (
                    <p id="first_name-error" className="text-red-400 text-xs mt-1 flex items-center gap-1">
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
                    className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.last_name ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                    }`}
                    placeholder="Dupont"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.last_name}
                    aria-describedby={fieldErrors.last_name ? 'last_name-error' : undefined}
                  />
                  {fieldErrors.last_name && (
                    <p id="last_name-error" className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="date_of_birth" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-purple-400" />
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
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.date_of_birth ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                    }`}
                    aria-required="true"
                    aria-invalid={!!fieldErrors.date_of_birth}
                    aria-describedby={fieldErrors.date_of_birth ? 'date_of_birth-error' : undefined}
                  />
                  {fieldErrors.date_of_birth && (
                    <p id="date_of_birth-error" className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.date_of_birth}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-emerald-400" />
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
                    className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                    }`}
                    placeholder="+33 6 12 34 56 78"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  />
                  {fieldErrors.phone && (
                    <p id="phone-error" className="text-red-400 text-xs mt-1 flex items-center gap-1">
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
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-3 sm:p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Mail size={18} className="text-cyan-400" />
                Contact et adresse
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-cyan-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 bg-[#1e293b] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#334155]'
                    }`}
                    placeholder="jean.dupont@email.com"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-pink-400" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="123 Rue de la Santé, 75000 Paris"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-3 sm:p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-orange-400" />
                Informations médicales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary_pathology" className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-yellow-400" />
                    Pathologie Principale
                  </label>
                  <input
                    type="text"
                    id="primary_pathology"
                    name="primary_pathology"
                    value={formData.primary_pathology}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Hypertension"
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
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-required="true"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact d'urgence
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Nom et numéro du contact d'urgence"
                  className="w-full px-4 py-3 bg-[#1e293b] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div className="mt-5 pt-4 border-t border-[#334155]">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-red-400" />
                  Signes vitaux
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="temperature" className="block text-xs font-medium text-gray-400 mb-1">
                      Température (°C)
                    </label>
                    <input
                      type="number"
                      id="temperature"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.1"
                      min="30"
                      max="45"
                      placeholder="37.0"
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="poids" className="block text-xs font-medium text-gray-400 mb-1">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      id="poids"
                      name="poids"
                      value={formData.poids}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.1"
                      min="0"
                      placeholder="70"
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="taille" className="block text-xs font-medium text-gray-400 mb-1">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      id="taille"
                      name="taille"
                      value={formData.taille}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="300"
                      placeholder="170"
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="pouls" className="block text-xs font-medium text-gray-400 mb-1">
                      Pouls (bpm)
                    </label>
                    <input
                      type="number"
                      id="pouls"
                      name="pouls"
                      value={formData.pouls}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="300"
                      placeholder="72"
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label htmlFor="tension_arterielle" className="block text-xs font-medium text-gray-400 mb-1">
                      Tension artérielle
                    </label>
                    <input
                      type="text"
                      id="tension_arterielle"
                      name="tension_arterielle"
                      value={formData.tension_arterielle}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="12/8"
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="glycemie" className="block text-xs font-medium text-gray-400 mb-1">
                      Glycémie (g/L)
                    </label>
                    <input
                      type="number"
                      id="glycemie"
                      name="glycemie"
                      value={formData.glycemie}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.01"
                      min="0"
                      placeholder="1.0"
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="test_palu" className="block text-xs font-medium text-gray-400 mb-1">
                      Test Palu rapide
                    </label>
                    <select
                      id="test_palu"
                      name="test_palu"
                      value={formData.test_palu}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Non testé</option>
                      <option value="positive">+ Positif</option>
                      <option value="negative">- Négatif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4">
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
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Notes additionnelles sur le patient (antécédents, allergies, observations, etc.)..."
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-[#334155]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-medium text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Annuler et fermer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                aria-label="Ajouter le nouveau patient"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <User size={18} />
                    <span>Ajouter le Patient</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;
