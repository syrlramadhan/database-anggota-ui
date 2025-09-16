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
    fotoFile: null, // Store the actual file
    angkatan: '',
    role: 'anggota', // Default value set to 'anggota'
    status_keanggotaan: 'aktif', // Default to 'aktif'
    jurusan: '',
    tanggal_dikukuhkan: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [fotoError, setPhotoError] = useState(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  const jurusanOptions = [
    { value: 'Backend', label: 'Backend' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'System', label: 'System' },
  ];

  const roleOptions = [
    { value: 'anggota', label: 'Anggota' },
    { value: 'bph', label: 'BPH' },
    { value: 'alb', label: 'ALB' },
    { value: 'dpo', label: 'DPO' },
    { value: 'bp', label: 'BP' }
  ];

  const statusKeangotaanOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'tidak_aktif', label: 'Tidak Aktif' }
  ];

  // Helper function to transform status for backend
  const transformStatusForBackend = (frontendStatus) => {
    // Keep underscore format for backend as well
    return frontendStatus;
  };

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
    if (!formData.angkatan.trim()) errors.angkatan = 'Angkatan wajib dipilih';
    else if (!/^\d{3}$/.test(formData.angkatan)) errors.angkatan = 'Format angkatan harus 3 digit (001, 002, 003, ...)';
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
        setFormData(prev => ({ 
          ...prev, 
          foto: e.target.result, // For preview
          fotoFile: file // Store actual file
        }));
      };
      reader.readAsDataURL(file);
    } else if (name === 'nra') {
      // Auto-format NRA to XX.XX.XXX
      let formattedValue = value.replace(/[^\d]/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 6) {
        formattedValue = formattedValue.substring(0, 5) + '.' + formattedValue.substring(5, 8);
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'angkatan') {
      // Auto-format angkatan to 3 digits with leading zeros
      let formattedValue = value.replace(/[^\d]/g, '');
      
      // Limit to maximum 3 digits
      if (formattedValue.length > 3) {
        formattedValue = formattedValue.substring(0, 3);
      }
      
      // Only pad with zeros when user stops typing or when exactly 3 digits
      // For now, just store the raw digits and let onBlur handle the padding
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'tanggal_dikukuhkan') {
      // Store date in YYYY-MM-DD format for input display
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAngkatanBlur = () => {
    // Format angkatan with leading zeros when user finishes typing
    if (formData.angkatan && formData.angkatan.length > 0) {
      const paddedValue = formData.angkatan.padStart(3, '0');
      setFormData(prev => ({ ...prev, angkatan: paddedValue }));
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
        setFormData(prev => ({ 
          ...prev, 
          foto: e.target.result, // For preview
          fotoFile: file // Store actual file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      nra: '',
      foto: null,
      fotoFile: null,
      angkatan: '',
      role: 'anggota', // Always reset to 'anggota'
      status_keanggotaan: 'aktif', // Always reset to 'aktif'
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
    
    // Convert date format from YYYY-MM-DD to DD-MM-YYYY for API
    const submitData = { ...formData };
    if (submitData.tanggal_dikukuhkan) {
      const date = new Date(submitData.tanggal_dikukuhkan);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      submitData.tanggal_dikukuhkan = `${day}-${month}-${year}`;
    }
    
    // Transform status_keanggotaan for backend
    if (submitData.status_keanggotaan) {
      submitData.status_keanggotaan = transformStatusForBackend(submitData.status_keanggotaan);
    }
    
    console.log('Data form yang akan dikirim:', submitData);
    onSubmit(submitData);
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
            Form ini digunakan untuk membuat akun anggota baru dengan data dasar. Admin perlu mengisi 
            nama, NRA (format XX.XX.XXX), angkatan (format 001-030), jurusan, foto (opsional), dan tanggal dikukuhkan (opsional).
          </p>
          <p>
            Setiap anggota baru akan otomatis memiliki <strong>Role: "Anggota"</strong> dan <strong>Status: "Aktif"</strong>. 
            Admin dapat mengubah role dan status ini nanti melalui menu edit anggota jika diperlukan.
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

          <div>
            <Input
              label="Angkatan"
              name="angkatan"
              value={formData.angkatan}
              onChange={handleInputChange}
              onBlur={handleAngkatanBlur}
              error={formErrors.angkatan}
              required
              placeholder="001, 002, ..., 013, 014"
              maxLength={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 3 digit angka (akan otomatis diformat dengan leading zero)
            </p>
          </div>

          <Select
            label="Jurusan"
            name="jurusan"
            value={formData.jurusan}
            onChange={handleInputChange}
            error={formErrors.jurusan}
            options={jurusanOptions}
            required
          />

          {/* Role dan Status Keanggotaan default akan menggunakan nilai otomatis */}
          {/* Default: Role = 'anggota', Status = 'aktif' */}

          {/* Status Keanggotaan Info */}
          <div className="md:col-span-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Role otomatis: <span className="font-semibold">Anggota</span> | Status otomatis: <span className="font-semibold">Aktif</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Setiap anggota baru akan otomatis memiliki role "Anggota" dan status "Aktif". Admin dapat mengubah ini nanti melalui menu edit anggota jika diperlukan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Input
              label="Tanggal Dikukuhkan (Opsional)"
              name="tanggal_dikukuhkan"
              type="date"
              value={formData.tanggal_dikukuhkan}
              onChange={handleInputChange}
              error={formErrors.tanggal_dikukuhkan}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tanggal akan disimpan dalam format DD-MM-YYYY
            </p>
          </div>
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
