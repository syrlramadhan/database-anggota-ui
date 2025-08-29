'use client';

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import config from '../../config';

export default function EditMemberForm({ 
  member, 
  onSuccess, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    nama: '',
    nra: '',
    foto: null,
    angkatan: '',
    status_keanggotaan: '',
    jurusan: '',
    tanggal_dikukuhkan: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [photoError, setPhotoError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const ALLOWED_STATUSES = ['anggota', 'bph', 'alb', 'dpo', 'bp'];

  const getStatusLabel = (status) => {
    const statusLabels = {
      'anggota': 'Anggota',
      'bph': 'Badan Pengurus Harian',
      'alb': 'Anggota Luar Biasa',
      'dpo': 'Dewan Pertimbangan Organisasi',
      'bp': 'Badan Pendiri'
    };
    return statusLabels[status] || status;
  };

  const formatNRA = (value) => {
    const numbersOnly = value.replace(/\D/g, '');
    const limitedNumbers = numbersOnly.slice(0, 7);
    
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 4) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2)}`;
    } else {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 4)}.${limitedNumbers.slice(4)}`;
    }
  };

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    if (dateStr.includes('-') && dateStr.split('-').length === 3) {
      const parts = dateStr.split('-');
      if (parts[0].length === 2) {
        return dateStr;
      }
    }
    
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nama.trim()) errors.nama = 'Nama wajib diisi';
    if (!formData.nra.trim()) errors.nra = 'Nomor Anggota wajib diisi';
    else if (!/^\d{2}\.\d{2}\.\d{3}$/.test(formData.nra)) errors.nra = 'Format NRA harus XX.XX.XXX (contoh: 13.24.005)';
    if (!formData.angkatan.trim()) errors.angkatan = 'Angkatan wajib diisi';
    else if (formData.angkatan.length > 4) errors.angkatan = 'Angkatan maksimum 4 karakter';
    if (!formData.status_keanggotaan) errors.status_keanggotaan = 'Status keanggotaan wajib dipilih';
    else if (!ALLOWED_STATUSES.includes(formData.status_keanggotaan))
      errors.status_keanggotaan = `Status harus salah satu dari: ${ALLOWED_STATUSES.join(', ')}`;
    if (!formData.jurusan) errors.jurusan = 'Jurusan wajib dipilih';
    return errors;
  };

  const validatePhoto = (file) => {
    if (!file) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Format gambar harus JPEG, PNG, atau GIF.';
    if (file.size > MAX_FILE_SIZE) return 'Ukuran gambar maksimum 2MB.';
    return null;
  };

  useEffect(() => {
    if (member) {
      setFormData({
        nama: member.name || '',
        nra: member.nra || '',
        foto: member.foto || null,
        angkatan: member.angkatan || '',
        status_keanggotaan: member.status_keanggotaan || '',
        jurusan: member.jurusan || '',
        tanggal_dikukuhkan: member.tanggal_dikukuhkan ? member.tanggal_dikukuhkan.split('-').reverse().join('-') : '',
      });
    }
  }, [member]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto' && files && files[0]) {
      const file = files[0];
      const photoError = validatePhoto(file);
      if (photoError) {
        setPhotoError(photoError);
        return;
      }
      setPhotoError(null);
      setFormData((prev) => ({ ...prev, foto: URL.createObjectURL(file) }));
    } else if (name === 'nra') {
      const formattedValue = formatNRA(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const photoError = validatePhoto(file);
    if (photoError) {
      setPhotoError(photoError);
      return;
    }
    setPhotoError(null);
    setFormData((prev) => ({ ...prev, foto: URL.createObjectURL(file) }));
  };

  const retryFetch = async (url, options, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhotoError(null);
    setIsLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      const formDataToSend = new FormData();
      formDataToSend.append('nama', formData.nama.trim());
      formDataToSend.append('nra', formData.nra.trim());
      formDataToSend.append('angkatan', formData.angkatan.trim());
      formDataToSend.append('status_keanggotaan', formData.status_keanggotaan);
      formDataToSend.append('jurusan', formData.jurusan);
      
      if (formData.tanggal_dikukuhkan.trim()) {
        const formattedDate = formatDateToDDMMYYYY(formData.tanggal_dikukuhkan);
        formDataToSend.append('TanggalDikukuhkan', formattedDate);
      }

      if (formData.foto && formData.foto.startsWith('blob:')) {
        const response = await fetch(formData.foto);
        const blob = await response.blob();
        const photoError = validatePhoto(blob);
        if (photoError) {
          setPhotoError(photoError);
          setIsLoading(false);
          return;
        }
        formDataToSend.append('foto', blob, 'profile.jpg');
      }

      const response = await retryFetch(`${config.api.url}${config.endpoints.member}/${member.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      await response.json();
      onSuccess?.();
    } catch (err) {
      setPhotoError(err.message.includes('login kembali') ? err.message : 'Gagal memperbarui anggota.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
    return colors[member?.id % colors.length] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Photo Error */}
      {photoError && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          {photoError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Photo */}
        <div className="flex justify-center mb-6">
          {formData.foto ? (
            <img
              src={formData.foto}
              alt="Pratinjau"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
            />
          ) : member?.foto ? (
            <img
              src={config.endpoints.uploads(member.foto)}
              alt={`Foto ${member.name}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
            />
          ) : (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-medium border-4 border-gray-200 shadow-sm ${getAvatarColor()}`}>
              {member?.avatar}
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Profil</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">Seret & lepas gambar di sini</p>
              <p className="text-xs text-gray-400 mb-3">atau</p>
            </div>
            <input
              type="file"
              name="foto"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleInputChange}
              className="hidden"
              id="foto-upload-edit"
            />
            <label
              htmlFor="foto-upload-edit"
              className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
            >
              Pilih Foto Baru
            </label>
            <p className="text-xs text-gray-400 mt-2">Format: JPEG, PNG, GIF (Max: 2MB)</p>
          </div>
        </div>

        {/* Form Fields */}
        <Input
          label="Nama Lengkap"
          name="nama"
          value={formData.nama}
          onChange={handleInputChange}
          error={formErrors.nama}
          required
        />

        <Input
          label="Nomor Anggota (NRA)"
          name="nra"
          value={formData.nra}
          onChange={handleInputChange}
          error={formErrors.nra}
          placeholder="Ketik angka, format otomatis: XX.XX.XXX"
          maxLength="9"
          required
          helperText={!formErrors.nra ? "Format akan otomatis menjadi XX.XX.XXX saat Anda mengetik angka" : undefined}
        />

        <Input
          label="Angkatan"
          name="angkatan"
          value={formData.angkatan}
          onChange={handleInputChange}
          error={formErrors.angkatan}
          placeholder="contoh: ABCD"
          maxLength={4}
          helperText="Maksimum 4 karakter"
          required
        />

        <Select
          label="Status Keanggotaan"
          name="status_keanggotaan"
          value={formData.status_keanggotaan}
          onChange={handleInputChange}
          error={formErrors.status_keanggotaan}
          required
        >
          <option value="">Pilih status</option>
          {ALLOWED_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </Select>

        <Select
          label="Jurusan"
          name="jurusan"
          value={formData.jurusan}
          onChange={handleInputChange}
          error={formErrors.jurusan}
          required
        >
          <option value="">Pilih jurusan</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="System">System</option>
        </Select>

        <Input
          label="Tanggal Dikukuhkan"
          type="date"
          name="tanggal_dikukuhkan"
          value={formData.tanggal_dikukuhkan}
          onChange={handleInputChange}
          error={formErrors.tanggal_dikukuhkan}
          helperText="Format: YYYY-MM-DD (akan dikonversi ke DD-MM-YYYY)"
        />

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Memproses...' : 'Perbarui Anggota'}
          </Button>
        </div>
      </form>
    </div>
  );
}
