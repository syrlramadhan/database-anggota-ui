'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import config from '../../config';
import { updateMember } from '../../services/memberService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import BackupSettings from '../../components/settings/BackupSettings';
import { useAuth } from '../../hooks/useAuth';

// Komponen Edit Profil
function EditProfileForm({ user, updateProfile, refetch }) {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomor_hp: '',
    jurusan: '',
    angkatan: '',
    foto: '',
    fotoFile: null,
    nra: '',
    tanggal_dikukuhkan: '',
    status_keanggotaan: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is admin (BPH or DPO)
  const isAdmin = user && (user.status_keanggotaan === 'bph' || user.status_keanggotaan === 'dpo');

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        email: user.email || '',
        nomor_hp: user.nomor_hp || '',
        jurusan: user.jurusan || '',
        angkatan: user.angkatan || '',
        foto: user.foto || '',
        fotoFile: null,
        nra: user.nra || '',
        tanggal_dikukuhkan: user.tanggal_dikukuhkan || '',
        status_keanggotaan: user.status_keanggotaan || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto' && files && files[0]) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setFormData((prev) => ({
          ...prev,
          fotoFile: file,
          foto: URL.createObjectURL(file)
        }));
      } else {
        setError('File yang dipilih bukan gambar.');
        setFormData((prev) => ({ ...prev, fotoFile: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // Hanya field yang bisa diedit untuk semua user (termasuk admin)
      const payload = {
        nama: formData.nama,
        email: formData.email,
        nomor_hp: formData.nomor_hp
      };
      
      // Foto khusus
      if (formData.fotoFile instanceof File) {
        payload.foto = formData.fotoFile;
      }
      
      // Kirim ke API
      const result = await updateMember(user.id_member || user.id, payload, token);
      if (result?.data?.foto) {
        setFormData(prev => ({
          ...prev,
          foto: result.data.foto,
          fotoFile: null
        }));
        if (updateProfile) updateProfile({ ...user, foto: result.data.foto });
        if (refetch) refetch();
      }
      alert('Profil berhasil diupdate');
    } catch (err) {
      setError(err.message || 'Gagal mengupdate profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-white text-xl">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Profil Saya</h2>
          <p className="text-gray-600 text-sm">
            Kelola informasi profil Anda
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl border border-gray-200">
          <label className="text-sm font-medium text-gray-700 mb-3">Foto Profil</label>
          <div className="relative group">
            {formData.foto ? (
              <div className="relative">
                <img
                  src={formData.fotoFile ? formData.foto : config.endpoints.uploads(formData.foto) + '?t=' + Date.now()}
                  alt="Foto Profil"
                  className="w-32 h-32 object-cover rounded-full cursor-pointer border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                  onClick={() => document.getElementById('fotoInput').click()}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center"
                     onClick={() => document.getElementById('fotoInput').click()}>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                    Ubah Foto
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => document.getElementById('fotoInput').click()}
              >
                <div className="text-center">
                  <span className="text-3xl text-gray-400 mb-2 block">📷</span>
                  <span className="text-gray-500 text-xs font-medium">Pilih Foto</span>
                </div>
              </div>
            )}
            <input
              id="fotoInput"
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Klik foto untuk mengganti • Format: JPG, PNG • Maksimal 5MB
          </p>
        </div>

        {/* All Information Fields */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-6">Informasi Profil</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap - Editable */}
            <div className="space-y-1">
              <Input
                label="Nama Lengkap *"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                placeholder="Masukkan nama lengkap"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Email - Editable */}
            <div className="space-y-1">
              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Masukkan email"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Nomor HP - Editable */}
            <div className="space-y-1">
              <Input
                label="Nomor HP *"
                name="nomor_hp"
                value={formData.nomor_hp}
                onChange={handleInputChange}
                required
                placeholder="Masukkan nomor HP"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* NRA - Read Only */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">NRA</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {formData.nra || 'Tidak tersedia'}
              </div>
            </div>

            {/* Jurusan - Read Only untuk semua */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Jurusan</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {formData.jurusan || 'Tidak tersedia'}
              </div>
            </div>

            {/* Angkatan - Read Only */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Angkatan</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {formData.angkatan || 'Tidak tersedia'}
              </div>
            </div>

            {/* Status Keanggotaan - Read Only untuk semua */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Status Keanggotaan</label>
              <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-gray-900 font-medium">
                  {getStatusLabel(formData.status_keanggotaan)}
                </span>
              </div>
            </div>

            {/* Tanggal Dikukuhkan - Read Only */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Dikukuhkan</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {formData.tanggal_dikukuhkan || 'Tidak tersedia'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">💾</span>
                Simpan Perubahan
              </div>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}

// Komponen Backup
function BackupSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-white text-xl">🗄️</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup Data</h2>
        </div>
      </div>
      <BackupSettings />
    </div>
  );
}

// Helper function untuk status label
const getStatusLabel = (status) => {
  const statusMap = {
    'anggota': 'Anggota',
    'bph': 'BPH (Badan Pengurus Harian)',
    'alb': 'ALB (Anggota Luar Biasa)',
    'dpo': 'DPO (Dewan Pertimbangan Organisasi)',
    'bp': 'BP (Badan Pendiri)'
  };
  return statusMap[status] || status?.toUpperCase() || 'Tidak tersedia';
};

const jurusanOptions = [
  { value: 'Backend', label: 'Back-end' },
  { value: 'Frontend', label: 'Front-end' },
  { value: 'System', label: 'System' }
];

const statusOptions = [
  { value: 'anggota', label: 'Anggota' },
  { value: 'bph', label: 'BPH (Badan Pengurus Harian)' },
  { value: 'alb', label: 'ALB (Anggota Luar Biasa)' },
  { value: 'dpo', label: 'DPO (Dewan Pertimbangan Organisasi)' },
  { value: 'bp', label: 'BP (Badan Pendiri)' }
];

export default function SettingsPage() {
  const { user, updateProfile, isLoading, refetch } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'backup' ? (
            <BackupSection />
          ) : (
            isLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat data profil...</p>
              </div>
            ) : user ? (
              <EditProfileForm user={user} updateProfile={updateProfile} refetch={refetch} />
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <span className="text-red-500 text-2xl mb-2 block">⚠️</span>
                <p className="text-red-700 font-medium">Gagal memuat data user</p>
              </div>
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
}