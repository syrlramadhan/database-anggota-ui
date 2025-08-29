'use client';

import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import config from '../../config';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomor_hp: '',
    jurusan: '',
    angkatan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nama: user.name || '',
        email: user.email || '',
        nomor_hp: user.nomor_hp || '',
        jurusan: user.jurusan || '',
        angkatan: user.angkatan || ''
      });
      setError('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      const response = await fetch(`${config.API_BASE_URL}/api/members/${user.id || user.id_member}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate profil');
      }

      const result = await response.json();
      
      // Update auth context if updateProfile function exists
      if (updateProfile) {
        updateProfile(result.data || result);
      }
      
      alert('Profil berhasil diupdate');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Gagal mengupdate profil');
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
    setError(''); // Clear error when user starts typing
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Profil Saya
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 py-3 bg-green-50 border-b border-green-200">
          <p className="text-sm text-green-700">
            Anda dapat mengupdate informasi profil Anda di sini. Status keanggotaan hanya dapat diubah oleh admin.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap"
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Masukkan email"
              />
              
              <Input
                label="Nomor HP"
                name="nomor_hp"
                value={formData.nomor_hp}
                onChange={handleChange}
                placeholder="Masukkan nomor HP"
              />
              
              <Input
                label="Jurusan"
                name="jurusan"
                value={formData.jurusan}
                onChange={handleChange}
                placeholder="Masukkan jurusan"
              />
              
              <div className="md:col-span-1">
                <Input
                  label="Angkatan"
                  name="angkatan"
                  value={formData.angkatan}
                  onChange={handleChange}
                  placeholder="Masukkan angkatan"
                />
              </div>
              
              {/* Display current status (read-only) */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Keanggotaan
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                  {user?.status_keanggotaan?.toUpperCase() || 'Tidak tersedia'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Status hanya dapat diubah oleh admin
                </p>
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
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
