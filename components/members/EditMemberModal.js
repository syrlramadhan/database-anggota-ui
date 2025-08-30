'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useAuth } from '../../hooks/useAuth';

export default function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  onSubmit 
}) {
  const { isAdmin, isCurrentUser } = useAuthorization();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    nra: '',
    email: '',
    nomor_hp: '',
    jurusan: '',
    angkatan: '',
    status_keanggotaan: '',
    tanggal_dikukuhkan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Only admin can edit status, but not their own status and not BP (Badan Pendiri)
  const canEditStatus = isAdmin && !isCurrentUser(member?.id) && member?.status_keanggotaan !== 'bp';
  
  // Check if editing own account
  const isEditingOwnAccount = () => {
    if (!user || !member) return false;
    return (
      member.id === user.id ||
      member.nra === user.nra ||
      member.email === user.email ||
      member.name === user.nama
    );
  };
  
  // Define which fields can be edited based on user type and context
  const canEditField = (fieldName) => {
    const editingOwnAccount = isEditingOwnAccount();
    
    if (fieldName === 'status_keanggotaan') {
      // Status can only be edited by admin, not for own account, and not for BP
      return canEditStatus;
    }
    
    if (fieldName === 'jurusan') {
      // Jurusan can be edited by admin for other members (including BP), not for own account
      return isAdmin && !editingOwnAccount;
    }
    
    if (editingOwnAccount) {
      // Current user can edit all their fields except status and jurusan
      return fieldName !== 'status_keanggotaan' && fieldName !== 'jurusan';
    }
    
    // Non-current user fields can only be edited by admin
    // For BP: only jurusan can be edited, status cannot
    // For others: both status and jurusan can be edited
    if (member?.status_keanggotaan === 'bp') {
      return isAdmin && fieldName === 'jurusan';
    }
    
    return isAdmin && (fieldName === 'status_keanggotaan' || fieldName === 'jurusan');
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        nama: member.name || '',
        nra: member.nra || '',
        email: member.email || '',
        nomor_hp: member.nomor_hp || '',
        jurusan: member.jurusan || '',
        angkatan: member.angkatan || '',
        status_keanggotaan: member.status_keanggotaan || '',
        tanggal_dikukuhkan: member.tanggal_dikukuhkan || ''
      });
    }
  }, [member, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Allow submit if editing own account or if admin editing status of others
    const editingOwnAccount = isEditingOwnAccount();
    if (!editingOwnAccount && !canEditStatus) return;

    setIsSubmitting(true);
    try {
      // Only submit status keanggotaan
      const submitData = {
        status_keanggotaan: formData.status_keanggotaan
      };

      await onSubmit(member.id, submitData);
      showNotification('success', 'Status anggota berhasil diperbarui!');
      
      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating member status:', error);
      showNotification('error', error.message || 'Gagal mengupdate status anggota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getModalTitle = () => {
    if (!isAdmin) return `Detail Anggota - ${member?.name || 'Unknown'}`;
    if (isCurrentUser(member?.id)) return `Detail Akun Saya - ${member?.name || 'Unknown'}`;
    if (member?.status_keanggotaan === 'bp') return `Detail BP (Badan Pendiri) - ${member?.name || 'Unknown'}`;
    return `Edit Status Anggota - ${member?.name || 'Unknown'}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {getModalTitle()}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Permission Info */}
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                {isEditingOwnAccount() && "Mode: Edit Profile (Dapat mengedit data personal kecuali status & jurusan)"}
                {!isEditingOwnAccount() && !isAdmin && "Mode: View Only (Hanya dapat melihat)"}
                {!isEditingOwnAccount() && isAdmin && member?.status_keanggotaan !== 'bp' && "Mode: Admin (Dapat edit status & jurusan anggota)"}
                {!isEditingOwnAccount() && isAdmin && member?.status_keanggotaan === 'bp' && "Mode: Admin BP (Dapat edit jurusan, status BP tidak dapat diubah)"}
              </span>
              <span className="text-blue-600 font-medium">
                Role: {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap {canEditField('nama') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    disabled={!canEditField('nama')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('nama') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NRA {canEditField('nra') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="nra"
                    value={formData.nra}
                    onChange={handleChange}
                    disabled={!canEditField('nra')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('nra') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {canEditField('email') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!canEditField('email')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('email') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor HP {canEditField('nomor_hp') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="nomor_hp"
                    value={formData.nomor_hp}
                    onChange={handleChange}
                    disabled={!canEditField('nomor_hp')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('nomor_hp') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jurusan {canEditField('jurusan') && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleChange}
                    disabled={!canEditField('jurusan')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('jurusan') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  >
                    <option value="">Pilih Jurusan</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="System">System</option>
                  </select>
                  {!canEditField('jurusan') && isEditingOwnAccount() && (
                    <p className="mt-1 text-xs text-amber-600">
                      Untuk pindah jurusan, hubungi Admin (BPH/DPO)
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Angkatan {canEditField('angkatan') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="angkatan"
                    value={formData.angkatan}
                    onChange={handleChange}
                    disabled={!canEditField('angkatan')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('angkatan') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  />
                </div>
                
                {/* Status - Only admin can edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Keanggotaan {canEditStatus && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    name="status_keanggotaan"
                    value={formData.status_keanggotaan}
                    onChange={handleChange}
                    disabled={!canEditStatus}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditStatus 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  >
                    <option value="">Pilih Status</option>
                    <option value="anggota">Anggota</option>
                    <option value="bph">BPH</option>
                    <option value="dpo">DPO</option>
                    <option value="alb">ALB</option>
                    <option value="bp">BP (Badan Pendiri)</option>
                  </select>
                  {!canEditStatus && !isCurrentUser(member?.id) && member?.status_keanggotaan !== 'bp' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Hanya admin yang dapat mengubah status keanggotaan
                    </p>
                  )}
                  {!canEditStatus && isEditingOwnAccount() && (
                    <p className="mt-1 text-xs text-amber-600">
                      Untuk mengubah status keanggotaan, hubungi Admin (BPH/DPO)
                    </p>
                  )}
                  {member?.status_keanggotaan === 'bp' && isAdmin && !isCurrentUser(member?.id) && (
                    <p className="text-xs text-red-600 mt-1">
                      Status BP (Badan Pendiri) tidak dapat diubah
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Dikukuhkan {canEditField('tanggal_dikukuhkan') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    name="tanggal_dikukuhkan"
                    value={formData.tanggal_dikukuhkan}
                    onChange={handleChange}
                    disabled={!canEditField('tanggal_dikukuhkan')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                      !canEditField('tanggal_dikukuhkan') 
                        ? 'border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : 'border-blue-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    }`}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {(!canEditStatus && !isEditingOwnAccount()) ? 'Tutup' : 'Batal'}
            </Button>
            {(canEditStatus || isEditingOwnAccount()) && (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 
                  isEditingOwnAccount() ? 'Simpan Profile' : 'Simpan Status'
                }
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] max-w-sm w-full">
          <div className={`
            rounded-lg shadow-lg border p-4 transition-all duration-300 transform
            ${notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className={`
                    rounded-md inline-flex transition-colors duration-200
                    ${notification.type === 'success' 
                      ? 'text-green-400 hover:text-green-600' 
                      : 'text-red-400 hover:text-red-600'
                    }
                  `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
