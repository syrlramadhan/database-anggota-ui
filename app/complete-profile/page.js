'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, Camera, CheckCircle, X } from 'lucide-react';
import config from '../../config';

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomor_hp: '',
    tanggal_dikukuhkan: '',
    foto: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const router = useRouter();

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  // Helper function to get photo URL from database
  const getPhotoUrl = (foto) => {
    if (!foto || foto === 'N/A' || foto === 'Foto') return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads/') || foto.includes('uploads/')) {
      const fileName = foto.replace('/uploads/', '').replace('uploads/', '');
      return config.endpoints.uploads(fileName);
    }
    return config.endpoints.uploads(foto);
  };

  const handleImageError = () => {
    // If image from database fails to load, remove preview
    if (userInfo?.foto && previewImage && previewImage.startsWith('http')) {
      setPreviewImage(null);
      console.warn('Failed to load profile image from database');
    }
  };

  const handleRemoveNewPhoto = () => {
    // Remove newly selected photo and revert to database photo if exists
    setFormData(prev => ({ ...prev, foto: null }));
    
    if (userInfo?.foto) {
      const photoUrl = getPhotoUrl(userInfo.foto);
      if (photoUrl) {
        setPreviewImage(photoUrl);
      }
    } else {
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    // Cek token dan ambil user info jika diperlukan
    const initializeProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        // Opsional: Get user info dari JWT untuk prefill data
        try {
          const profileResponse = await fetch(`${config.api.url}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (profileResponse.ok) {
            const data = await profileResponse.json();
            if (data.code === 200 && data.data) {
              setUserInfo(data.data);
              
              // Prefill existing data if any
              setFormData(prev => ({
                ...prev,
                nama: data.data.nama || '',
                email: data.data.email || '',
                nomor_hp: data.data.nomor_hp || '',
                tanggal_dikukuhkan: data.data.tanggal_dikukuhkan || ''
              }));

              // Set existing photo if available
              if (data.data.foto) {
                const photoUrl = getPhotoUrl(data.data.foto);
                if (photoUrl) {
                  setPreviewImage(photoUrl);
                }
              }
            }
          }
        } catch (profileErr) {
          console.log('Could not fetch profile data, proceeding with empty form');
        }
      } catch (err) {
        console.error('Error initializing profile:', err);
        router.push('/');
      }
    };

    initializeProfile();
  }, [router]);

  const validateForm = () => {
    if (!formData.nama.trim()) {
      setError('Nama lengkap harus diisi.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email harus diisi.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Format email tidak valid.');
      return false;
    }
    if (!formData.nomor_hp.trim()) {
      setError('Nomor HP harus diisi.');
      return false;
    }
    if (!/^[0-9+\-\s()]+$/.test(formData.nomor_hp)) {
      setError('Format nomor HP tidak valid.');
      return false;
    }
    if (!formData.tanggal_dikukuhkan) {
      setError('Tanggal dikukuhkan harus diisi.');
      return false;
    }
    // Remove foto validation - it's optional if user already has photo in database
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Ukuran file foto maksimal 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar.');
        return;
      }
      
      // Clear any existing error
      setError(null);
      
      setFormData(prev => ({ ...prev, foto: file }));
      
      // Create preview for new uploaded file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      // Format tanggal dari YYYY-MM-DD ke DD-MM-YYYY untuk backend
      const formatDateForBackend = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
      };

      const formDataToSend = new FormData();
      formDataToSend.append('nama', formData.nama.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('nomor_hp', formData.nomor_hp.trim());
      formDataToSend.append('tanggal_dikukuhkan', formatDateForBackend(formData.tanggal_dikukuhkan));
      
      // Always send a photo - either new file or existing photo as blob
      if (formData.foto) {
        // User selected new file
        formDataToSend.append('foto', formData.foto);
      } else if (userInfo?.foto && previewImage && previewImage.startsWith('http')) {
        // User keeping existing photo - convert to blob and send
        try {
          const response = await fetch(previewImage);
          const blob = await response.blob();
          
          // Create a file from the blob with proper name
          const file = new File([blob], `profile_${userInfo.nra || 'photo'}.jpg`, { type: blob.type });
          formDataToSend.append('foto', file);
        } catch (fetchError) {
          console.warn('Could not fetch existing photo, proceeding without photo');
          // If fetching existing photo fails, we'll send without foto
        }
      }

      const response = await fetch(`${config.api.url}/profile/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Respons server tidak valid. Silakan coba lagi nanti.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Token tidak valid. Silakan login ulang.');
        }
        throw new Error(data.message || 'Gagal melengkapi profile. Silakan coba lagi.');
      }

      // Berhasil melengkapi profile, arahkan ke dashboard
      showNotification('success', 'Profile berhasil dilengkapi! Mengarahkan ke Dashboard...');
      
      // Delay redirect to show notification
      setTimeout(() => {
        router.push('/Dashboard');
      }, 1500);
    } catch (err) {
      if (err.message.includes('Token tidak valid')) {
        router.push('/');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Lengkapi Profile Anda
          </h1>
          <p className="text-gray-600 text-sm">
            Silakan lengkapi informasi profile Anda untuk dapat menggunakan sistem
          </p>
          {userInfo && (
            <div className="mt-3 text-sm text-gray-500">
              Selamat datang, <span className="font-medium">{userInfo.nama || 'User'}</span> • NRA: {userInfo.nra || '-'}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Photo Upload */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Foto Profile {userInfo?.foto ? userInfo?.nama : ''}
            </label>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {previewImage && userInfo?.foto && previewImage.startsWith('http') ? 
                  'Foto dari database akan digunakan (klik kamera untuk mengganti)' : 
                  previewImage && formData.foto ?
                  'Foto baru dipilih (akan mengganti foto lama)' :
                  'Upload foto profile (maksimal 5MB)'
                }
              </p>
              {previewImage && userInfo?.foto && previewImage.startsWith('http') && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Akan menggunakan foto yang sudah ada
                </p>
              )}
              {previewImage && formData.foto && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Foto baru akan diupload
                </p>
              )}
              
              {/* Button to cancel new photo selection and revert to database photo */}
              {formData.foto && userInfo?.foto && (
                <button
                  type="button"
                  onClick={handleRemoveNewPhoto}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  disabled={isLoading}
                >
                  Batalkan foto baru & gunakan foto database
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Nomor HP */}
            <div>
              <label htmlFor="nomor_hp" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor HP *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="nomor_hp"
                  name="nomor_hp"
                  type="tel"
                  placeholder="08xx-xxxx-xxxx"
                  value={formData.nomor_hp}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Tanggal Dikukuhkan */}
            <div>
              <label htmlFor="tanggal_dikukuhkan" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Dikukuhkan *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="tanggal_dikukuhkan"
                  name="tanggal_dikukuhkan"
                  type="date"
                  value={formData.tanggal_dikukuhkan}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Menyimpan Profile...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Lengkapi Profile & Lanjutkan
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>* Field yang wajib diisi</p>
          <p className="mt-1">Setelah melengkapi profile, Anda akan diarahkan ke Dashboard</p>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className={`
            rounded-lg shadow-lg border p-4 transition-all duration-300 transform
            ${notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className="rounded-md inline-flex text-green-400 hover:text-green-600 transition-colors duration-200"
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