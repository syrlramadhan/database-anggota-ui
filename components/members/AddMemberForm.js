'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function AddMemberForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
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
  const [fotoError, setPhotoError] = useState(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const ALLOWED_STATUSES = ['anggota', 'bph', 'alb', 'dpo', 'bp'];

  const statusOptions = [
    { value: 'anggota', label: 'Anggota' },
    { value: 'bph', label: 'BPH (Badan Pengurus Harian)' },
    { value: 'alb', label: 'ALB (Anggota Luar Biasa)' },
    { value: 'dpo', label: 'DPO (Dewan Pengawas Organisasi)' },
    { value: 'bp', label: 'BP (Badan Pendiri)' }
  ];

  const jurusanOptions = [
    { value: 'Teknik Informatika', label: 'Teknik Informatika' },
    { value: 'Sistem Informasi', label: 'Sistem Informasi' },
    { value: 'Teknik Komputer', label: 'Teknik Komputer' },
    { value: 'Manajemen Informatika', label: 'Manajemen Informatika' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Fullstack', label: 'Fullstack' },
    { value: 'Mobile Developer', label: 'Mobile Developer' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Cybersecurity', label: 'Cybersecurity' }
  ];

  const validatePhoto = (file) => {
    if (!file) return null;
    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran file tidak boleh lebih dari 2MB';
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Format file harus JPEG, PNG, atau GIF';
    }
    return null;
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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'foto' && files && files[0]) {
      const file = files[0];
      const error = validatePhoto(file);
      if (error) {
        setPhotoError(error);
        return;
      }
      setPhotoError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, foto: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (name === 'nra') {
      // Auto-format NRA
      let formattedValue = value.replace(/[^\d]/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 6) {
        formattedValue = formattedValue.substring(0, 6) + '.' + formattedValue.substring(6, 9);
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const error = validatePhoto(file);
      if (error) {
        setPhotoError(error);
        return;
      }
      setPhotoError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, foto: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      nra: '',
      foto: null,
      angkatan: '',
      status_keanggotaan: '',
      jurusan: '',
      tanggal_dikukuhkan: '',
    });
    setFormErrors({});
    setPhotoError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit(formData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Tambah Anggota Baru"
      size="lg"
    >
      {/* Informasi Workflow */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">Informasi Penting</h3>
        <div className="text-sm text-blue-700 space-y-3">
          <p>
            Form ini digunakan untuk membuat akun anggota baru dengan data dasar. Admin hanya perlu mengisi 
            nama, NRA, angkatan, status keanggotaan, jurusan, foto (opsional), dan tanggal dikukuhkan (opsional).
          </p>
          <p>
            Setelah akun dibuat, sistem akan menghasilkan token login khusus untuk anggota baru tersebut. 
            Token ini berfungsi sebagai kunci untuk login pertama kali dan harus diberikan kepada anggota yang bersangkutan.
          </p>
          <p>
            Anggota akan menggunakan token tersebut untuk login pertama kali, kemudian diminta untuk melengkapi 
            profil mereka seperti email, nomor telepon, password, dan data pribadi lainnya.
          </p>
          <p>
            Setelah profil dilengkapi dan password dibuat, token akan otomatis dihapus dari sistem. 
            Untuk login selanjutnya, anggota akan menggunakan NRA dan password yang telah mereka buat.
          </p>
          <p className="text-xs italic">
            Catatan: Sistem ini memungkinkan admin untuk fokus mengelola data dasar anggota, 
            sementara anggota sendiri yang bertanggung jawab melengkapi dan mengelola data pribadi mereka.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Profil</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {formData.foto ? (
              <div className="flex flex-col items-center">
                <img
                  src={formData.foto}
                  alt="Pratinjau"
                  className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-200"
                />
                <p className="text-sm text-gray-500">Seret gambar baru atau klik untuk mengganti</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Seret & lepas gambar di sini</p>
                <p className="text-xs text-gray-400 mb-3">atau</p>
              </div>
            )}
            <input
              type="file"
              name="foto"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleInputChange}
              className="hidden"
              id="foto-upload"
            />
            <label
              htmlFor="foto-upload"
              className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
            >
              {formData.foto ? 'Ganti Foto' : 'Pilih Foto'}
            </label>
            <p className="text-xs text-gray-400 mt-2">Format: JPEG, PNG, GIF (Max: 2MB)</p>
          </div>
          {fotoError && (
            <p className="text-sm text-red-500 mt-1 flex items-center">
              <span className="w-4 h-4 mr-1">⚠️</span>
              {fotoError}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nama Lengkap"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            error={formErrors.nama}
            required
            placeholder="Masukkan nama lengkap"
          />

          <Input
            label="Nomor Anggota (NRA)"
            name="nra"
            value={formData.nra}
            onChange={handleInputChange}
            error={formErrors.nra}
            required
            placeholder="XX.XX.XXX"
            maxLength={9}
          />

          <Input
            label="Angkatan"
            name="angkatan"
            value={formData.angkatan}
            onChange={handleInputChange}
            error={formErrors.angkatan}
            required
            placeholder="contoh: ABCD"
            maxLength={4}
          />

          <Select
            label="Status Keanggotaan"
            name="status_keanggotaan"
            value={formData.status_keanggotaan}
            onChange={handleInputChange}
            error={formErrors.status_keanggotaan}
            options={statusOptions}
            required
          />

          <Select
            label="Jurusan"
            name="jurusan"
            value={formData.jurusan}
            onChange={handleInputChange}
            error={formErrors.jurusan}
            options={jurusanOptions}
            required
          />

          <Input
            label="Tanggal Dikukuhkan (Opsional)"
            name="tanggal_dikukuhkan"
            type="date"
            value={formData.tanggal_dikukuhkan}
            onChange={handleInputChange}
            error={formErrors.tanggal_dikukuhkan}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Simpan Anggota
          </Button>
        </div>
      </form>
    </Modal>
  );
}
