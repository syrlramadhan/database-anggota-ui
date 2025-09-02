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
      // Ambil value email dan nomor_hp langsung dari input form agar pasti terbaru
      const payload = { ...formData };
      const form = e.target;
      if (form.elements.email) payload.email = form.elements.email.value;
      if (form.elements.nomor_hp) payload.nomor_hp = form.elements.nomor_hp.value;
      // Format tanggal_dikukuhkan jika ada
      if (payload.tanggal_dikukuhkan) {
        const [y, m, d] = payload.tanggal_dikukuhkan.split('-');
        payload.tanggal_dikukuhkan = `${d}-${m}-${y}`;
      }
      // Foto khusus
      if (formData.fotoFile instanceof File) {
        payload.foto = formData.fotoFile;
      }
      // Kirim ke API
      const result = await updateMember(user.id_member || user.id, payload, token);
          if (result?.data?.foto) {
            setFormData(prev => ({
              ...prev,
              foto: result.data.foto, // path dari backend
              fotoFile: null // reset preview file
            }));
            if (updateProfile) updateProfile({ ...user, foto: result.data.foto });
            if (refetch) refetch(); // refresh user context (header)
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
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-white text-xl">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Profil Saya</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
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
                className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 group"
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Input
              label="Nama Lengkap"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              required
              placeholder="Masukkan nama lengkap"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Masukkan email"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Input
              label="Nomor HP"
              name="nomor_hp"
              value={formData.nomor_hp}
              onChange={handleInputChange}
              required
              placeholder="Masukkan nomor HP"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Select
              label="Jurusan"
              name="jurusan"
              value={formData.jurusan}
              onChange={handleInputChange}
              options={jurusanOptions}
              required
              placeholder="Pilih Jurusan"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Input
              label="Angkatan"
              name="angkatan"
              value={formData.angkatan}
              onChange={handleInputChange}
              required
              placeholder="Masukkan angkatan"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Input
              label="NRA"
              name="nra"
              value={formData.nra}
              readOnly
              placeholder="NRA"
              className="bg-gray-50 border-gray-200"
            />
          </div>
          <div className="space-y-1">
            <Input
              label="Tanggal Dikukuhkan"
              name="tanggal_dikukuhkan"
              value={formData.tanggal_dikukuhkan}
              readOnly
              placeholder="Tanggal Dikukuhkan"
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status Keanggotaan</label>
          {user && (user.status_keanggotaan === 'bph' || user.status_keanggotaan === 'dpo') ? (
            <Select
              name="status_keanggotaan"
              value={formData.status_keanggotaan}
              onChange={handleInputChange}
              options={[
                { value: 'anggota', label: 'Anggota' },
                { value: 'bph', label: 'BPH' },
                { value: 'dpo', label: 'DPO' },
                { value: 'alb', label: 'ALB' }
              ]}
              placeholder="Pilih Status"
              className="bg-white"
            />
          ) : (
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white border border-blue-200 rounded-lg shadow-sm">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-gray-900 font-medium">
                  {user.status_keanggotaan?.toUpperCase() || 'Tidak tersedia'}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2 flex items-center">
                <span className="mr-1">ℹ️</span>
                Status hanya dapat diubah oleh BPH atau DPO
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
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

const jurusanOptions = [
  { value: 'Backend', label: 'Back-end' },
  { value: 'Frontend', label: 'Front-end' },
  { value: 'System', label: 'System' }
];

const statusOptions = [
  { value: 'anggota', label: 'Anggota' },
  { value: 'bph', label: 'BPH (Badan Pengurus Harian)' },
  { value: 'alb', label: 'ALB (Anggota Luar Biasa)' },
  { value: 'dpo', label: 'DPO (Dewan Pengurus Organisasi)' },
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