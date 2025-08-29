'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthorization } from '../../hooks/useAuthorization';

export default function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  onSubmit 
}) {
  const { isAdmin, canEditFullProfile, isCurrentUser } = useAuthorization();
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

  // Determine what user can edit
  const canEditStatus = canEditFullProfile; // Only admin can edit status
  const canEditProfile = canEditFullProfile || isCurrentUser(member?.id); // Admin or own profile
  const isViewOnly = !canEditProfile;

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
    if (isViewOnly) return;

    setIsSubmitting(true);
    try {
      // Prepare data based on user permissions
      let submitData;
      
      if (canEditFullProfile) {
        // Admin can edit everything
        submitData = formData;
      } else if (isCurrentUser(member?.id)) {
        // User can only edit their own profile (excluding status)
        submitData = {
          nama: formData.nama,
          email: formData.email,
          nomor_hp: formData.nomor_hp,
          jurusan: formData.jurusan,
          angkatan: formData.angkatan
        };
      } else {
        throw new Error('Unauthorized to edit this member');
      }

      await onSubmit(member.id, submitData);
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      alert(error.message || 'Gagal mengupdate anggota');
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
    if (isViewOnly) return `Detail Anggota - ${member?.name || 'Unknown'}`;
    if (canEditFullProfile) return `Edit Anggota - ${member?.name || 'Unknown'}`;
    return `Edit Profil Saya - ${member?.name || 'Unknown'}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
              {isViewOnly && "Mode: View Only (Hanya dapat melihat)"}
              {canEditFullProfile && "Mode: Admin (Dapat edit semua field)"}
              {!canEditFullProfile && !isViewOnly && "Mode: Edit Profil Sendiri (Tidak dapat edit status)"}
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
              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                disabled={isViewOnly}
                required={!isViewOnly}
              />
              
              <Input
                label="NRA"
                name="nra"
                value={formData.nra}
                onChange={handleChange}
                disabled={isViewOnly || !canEditFullProfile} // Only admin can edit NRA
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isViewOnly}
                required={!isViewOnly}
              />
              
              <Input
                label="Nomor HP"
                name="nomor_hp"
                value={formData.nomor_hp}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              
              <Input
                label="Jurusan"
                name="jurusan"
                value={formData.jurusan}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              
              <Input
                label="Angkatan"
                name="angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              
              {/* Status - Only admin can edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Keanggotaan
                </label>
                <select
                  name="status_keanggotaan"
                  value={formData.status_keanggotaan}
                  onChange={handleChange}
                  disabled={!canEditStatus}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !canEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Pilih Status</option>
                  <option value="anggota">Anggota</option>
                  <option value="bph">BPH</option>
                  <option value="dpo">DPO</option>
                  <option value="alb">ALB</option>
                  <option value="bp">BP</option>
                </select>
                {!canEditStatus && (
                  <p className="text-xs text-gray-500 mt-1">
                    Hanya admin yang dapat mengubah status keanggotaan
                  </p>
                )}
              </div>
              
              <Input
                label="Tanggal Dikukuhkan"
                name="tanggal_dikukuhkan"
                type="date"
                value={formData.tanggal_dikukuhkan}
                onChange={handleChange}
                disabled={isViewOnly || !canEditFullProfile} // Only admin can edit
              />
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
            {isViewOnly ? 'Tutup' : 'Batal'}
          </Button>
          {!isViewOnly && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
