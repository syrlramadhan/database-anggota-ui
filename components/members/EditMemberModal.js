'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

export default function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  onSubmit 
}) {
  const { isAdmin, isCurrentUser } = useAuthorization();
  const { user } = useAuth();
  const { needsStatusChangeNotification, sendStatusChangeNotification } = useNotifications();
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
  const [originalData, setOriginalData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
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

  // Check if status change needs confirmation notification
  const needsStatusChangeConfirmation = () => {
    if (!user || !member) return false;
    
    const currentUserStatus = user.status_keanggotaan;
    const originalStatus = originalData.status_keanggotaan;
    const newStatus = formData.status_keanggotaan;
    const isEditingSelf = isCurrentUser(member?.id);
    
    // Only check if status is actually changing
    if (originalStatus === newStatus) return false;
    
    // Use the notification logic from useNotifications hook
    return needsStatusChangeNotification(currentUserStatus, originalStatus, newStatus, isEditingSelf);
  };

  // Check if there are any changes in the form
  const hasChanges = () => {
    const editingOwnAccount = isEditingOwnAccount();
    const canEditBPJurusan = member?.status_keanggotaan === 'bp' && isAdmin && !isCurrentUser(member?.id);
    
    // Check for changes in any editable field
    let hasAnyChanges = false;
    
    if (editingOwnAccount) {
      // Check editable fields for own account (all except status and jurusan)
      hasAnyChanges = (
        formData.nama !== originalData.nama ||
        formData.nra !== originalData.nra ||
        formData.email !== originalData.email ||
        formData.nomor_hp !== originalData.nomor_hp ||
        formData.angkatan !== originalData.angkatan ||
        formData.tanggal_dikukuhkan !== originalData.tanggal_dikukuhkan
      );
    } else if (canEditBPJurusan) {
      // For BP, only check jurusan
      hasAnyChanges = formData.jurusan !== originalData.jurusan;
    } else if (canEditStatus) {
      // For admin editing others' status, check both status and jurusan (if not BP)
      hasAnyChanges = formData.status_keanggotaan !== originalData.status_keanggotaan;
      
      // Also check jurusan if this user can edit it
      if (member?.status_keanggotaan !== 'bp') {
        hasAnyChanges = hasAnyChanges || (formData.jurusan !== originalData.jurusan);
      }
    }
    
    return hasAnyChanges;
  };

  // Get available status options based on current status and hierarchy rules
  const getAvailableStatusOptions = () => {
    const currentStatus = member?.status_keanggotaan;
    
    if (!currentStatus) {
      // If no current status, show all options
      return [
        { value: "anggota", label: "Anggota" },
        { value: "bph", label: "BPH" },
        { value: "dpo", label: "DPO" },
        { value: "alb", label: "ALB" },
        { value: "bp", label: "BP (Badan Pendiri)" }
      ];
    }

    switch (currentStatus) {
      case 'anggota':
        // Anggota bisa naik ke BPH atau langsung ke BP (sementara)
        return [
          { value: "anggota", label: "Anggota" },
          { value: "bph", label: "BPH" },
          { value: "bp", label: "BP (Badan Pendiri)" }
        ];
        
      case 'bph':
        // BPH bisa turun ke anggota atau naik ke DPO/ALB
        return [
          { value: "anggota", label: "Anggota" },
          { value: "bph", label: "BPH" },
          { value: "dpo", label: "DPO" },
          { value: "alb", label: "ALB" }
        ];
        
      case 'dpo':
        // DPO tidak bisa turun, hanya bisa pindah ke ALB
        return [
          { value: "dpo", label: "DPO" },
          { value: "alb", label: "ALB" }
        ];
        
      case 'alb':
        // ALB hanya bisa pindah ke DPO
        return [
          { value: "alb", label: "ALB" },
          { value: "dpo", label: "DPO" }
        ];
        
      case 'bp':
        // BP tidak bisa diubah
        return [
          { value: "bp", label: "BP (Badan Pendiri)" }
        ];
        
      default:
        // Default fallback
        return [
          { value: "anggota", label: "Anggota" },
          { value: "bph", label: "BPH" },
          { value: "dpo", label: "DPO" },
          { value: "alb", label: "ALB" },
          { value: "bp", label: "BP (Badan Pendiri)" }
        ];
    }
  };

  useEffect(() => {
    if (member && isOpen) {
      const memberData = {
        nama: member.name || '',
        nra: member.nra || '',
        email: member.email || '',
        nomor_hp: member.nomor_hp || '',
        jurusan: member.jurusan || '',
        angkatan: member.angkatan || '',
        status_keanggotaan: member.status_keanggotaan || '',
        tanggal_dikukuhkan: member.tanggal_dikukuhkan || ''
      };
      setFormData(memberData);
      setOriginalData(memberData);
    }
  }, [member, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Allow submit if editing own account, admin editing status of others, or admin editing BP's jurusan
    const editingOwnAccount = isEditingOwnAccount();
    const canEditBPJurusan = member?.status_keanggotaan === 'bp' && isAdmin && !isCurrentUser(member?.id);
    
    if (!editingOwnAccount && !canEditStatus && !canEditBPJurusan) return;
    
    // Don't submit if no changes
    if (!hasChanges()) return;

    let submitData = {};
    
    if (editingOwnAccount) {
      // Submit all editable fields for own account
      submitData = {
        nama: formData.nama,
        nra: formData.nra,
        email: formData.email,
        nomor_hp: formData.nomor_hp,
        angkatan: formData.angkatan,
        tanggal_dikukuhkan: formData.tanggal_dikukuhkan
      };
    } else if (canEditBPJurusan) {
      // For BP, only submit jurusan
      submitData = {
        jurusan: formData.jurusan
      };
    } else if (canEditStatus) {
      // For admin editing others' status and jurusan (if not BP)
      submitData = {
        status_keanggotaan: formData.status_keanggotaan
      };
      
      // Also include jurusan if this is not BP and it has changed
      if (member?.status_keanggotaan !== 'bp') {
        submitData.jurusan = formData.jurusan;
      }
    }

    // Check if status change needs confirmation
    if (needsStatusChangeConfirmation() && !showConfirmModal) {
      setPendingSubmitData(submitData);
      setShowConfirmModal(true);
      return;
    }

    // Proceed with actual submission
    await performSubmit(submitData);
  };

  const performSubmit = async (submitData) => {
    setIsSubmitting(true);
    try {
      const editingOwnAccount = isEditingOwnAccount();
      const canEditBPJurusan = member?.status_keanggotaan === 'bp' && isAdmin && !isCurrentUser(member?.id);
      
      // Check if this is a status change that needs notification
      const needsNotification = needsStatusChangeConfirmation();
      
      if (needsNotification && submitData.status_keanggotaan) {
        // Send notification instead of direct update
        const originalStatus = originalData.status_keanggotaan;
        const newStatus = submitData.status_keanggotaan;
        
        await sendStatusChangeNotification(member.id, originalStatus, newStatus);
        
        showNotification('success', 'Permintaan perubahan status telah dikirim untuk konfirmasi!');
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Normal update without notification
        await onSubmit(member.id, submitData);
        
        const successMessage = editingOwnAccount ? 'Profile berhasil diperbarui!' : 
                             canEditBPJurusan ? 'Jurusan berhasil diperbarui!' : 
                             'Data anggota berhasil diperbarui!';
        showNotification('success', successMessage);
        
        // Close modal after short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      showNotification('error', error.message || 'Gagal mengupdate data anggota');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setPendingSubmitData(null);
    }
  };

  const handleConfirmSubmit = async () => {
    if (pendingSubmitData) {
      await performSubmit(pendingSubmitData);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingSubmitData(null);
  };

  const getConfirmationMessage = () => {
    if (!user || !member) return '';
    
    const currentUserStatus = user.status_keanggotaan;
    const originalStatus = originalData.status_keanggotaan;
    const newStatus = formData.status_keanggotaan;
    
    const statusLabels = {
      'anggota': 'Anggota',
      'bph': 'BPH',
      'dpo': 'DPO', 
      'alb': 'ALB',
      'bp': 'BP'
    };
    
    return `Anda akan mengubah status ${member.name} dari ${statusLabels[originalStatus]} menjadi ${statusLabels[newStatus]}. Notifikasi akan dikirim kepada yang bersangkutan. Lanjutkan?`;
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
                    {getAvailableStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {canEditStatus && (
                    <div className="mt-1 text-xs text-blue-600">
                      <p>Aturan status: 
                        {member?.status_keanggotaan === 'anggota' && " Anggota → BPH atau BP"}
                        {member?.status_keanggotaan === 'bph' && " BPH → Anggota, DPO, atau ALB"}
                        {member?.status_keanggotaan === 'dpo' && " DPO → ALB (tidak bisa turun)"}
                        {member?.status_keanggotaan === 'alb' && " ALB → DPO"}
                        {member?.status_keanggotaan === 'bp' && " BP tidak dapat diubah"}
                      </p>
                    </div>
                  )}
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
              {(!canEditStatus && !isEditingOwnAccount() && !(member?.status_keanggotaan === 'bp' && isAdmin && !isCurrentUser(member?.id))) ? 'Tutup' : 'Batal'}
            </Button>
            {(canEditStatus || isEditingOwnAccount() || (member?.status_keanggotaan === 'bp' && isAdmin && !isCurrentUser(member?.id))) && (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !hasChanges()}
                className={`${
                  !hasChanges() && !isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                    : ''
                }`}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancelConfirm}
            />
            
            {/* Confirmation Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Konfirmasi Perubahan Status
                </h3>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      {getConfirmationMessage()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelConfirm}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Ya, Lanjutkan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}