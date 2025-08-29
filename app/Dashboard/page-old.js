'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sesi tidak valid. Silakan login kembali.');
      router.push('/');
      return;
    }
    fetchMembers();
  }, [router]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dbanggota.syahrulramadhan.site/api/member', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesi expired. Silakan login kembali.');
        }
        throw new Error('Gagal mengambil data anggota.');
      }

      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Struktur respons API tidak valid.');
      }

      setMembers(data.data.filter(member => member.id));
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal mengambil data anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/')
          return
        }
        throw new Error('Gagal mengambil data anggota')
      }

      const data = await response.json()
      console.log('API Members Response:', data) // Debug: Log respon API
      setMembers(data.data.map(member => ({
        id: member.id,
        name: member.nama,
        nra: member.nomorAnggota,
        email: member.email,
        alamat: member.alamat,
        nomorTelepon: member.nomorTelepon,
        avatar: member.nama.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(),
        photo: member.photo
      })))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.nama.trim()) errors.nama = 'Nama wajib diisi'
    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid'
    }
    if (!formData.nomorAnggota.trim()) errors.nomorAnggota = 'Nomor Anggota wajib diisi'
    if (!formData.alamat.trim()) errors.alamat = 'Alamat wajib diisi'
    if (!formData.nomorTelepon.trim()) {
      errors.nomorTelepon = 'Nomor Telepon wajib diisi'
    } else if (!/^\+?\d{10,15}$/.test(formData.nomorTelepon)) {
      errors.nomorTelepon = 'Nomor telepon tidak valid'
    }
    if (!formData.password) errors.password = 'Kata sandi wajib diisi'
    else if (formData.password.length < 6) errors.password = 'Kata sandi harus minimal 6 karakter'
    return errors
  }

  const validatePhoto = (file) => {
    if (!file) return null
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Format gambar tidak didukung. Gunakan JPEG, PNG, atau GIF.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran gambar terlalu besar. Maksimum 2MB.'
    }
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setError(null)
    setPhotoError(null)
    setIsLoading(true)

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }
      const formDataToSend = new FormData()
      formDataToSend.append('nama', formData.nama)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('nomorAnggota', formData.nomorAnggota)
      formDataToSend.append('alamat', formData.alamat)
      formDataToSend.append('nomorTelepon', formData.nomorTelepon)
      formDataToSend.append('password', formData.password)
      if (formData.photo) {
        const response = await fetch(formData.photo)
        const blob = await response.blob()
        const photoError = validatePhoto(blob)
        if (photoError) {
          setPhotoError(photoError)
          setIsLoading(false)
          return
        }
        formDataToSend.append('photo', blob, 'profile.jpg')
      }

      const response = await fetch('https://dbanggota.syahrulramadhan.site/api/member', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/')
          return
        }
        const data = await response.json()
        throw new Error(data.message || 'Gagal menambah anggota')
      }

      const newMember = await response.json()
      setMembers(prev => [...prev, {
        id: newMember.data.id,
        name: newMember.data.nama,
        nra: newMember.data.nomorAnggota,
        email: newMember.data.email,
        alamat: newMember.data.alamat,
        nomorTelepon: newMember.data.nomorTelepon,
        avatar: newMember.data.nama.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(),
        photo: newMember.data.photo
      }])
      setShowAddModal(false)
      setFormData({
        nama: '',
        email: '',
        nomorAnggota: '',
        alamat: '',
        nomorTelepon: '',
        password: '',
        photo: null
      })
      setFormErrors({})
      setPhotoError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo' && files && files[0]) {
      const file = files[0]
      const photoError = validatePhoto(file)
      if (photoError) {
        setPhotoError(photoError)
        return
      }
      setFormData({
        ...formData,
        photo: URL.createObjectURL(file)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    const photoError = validatePhoto(file)
    if (photoError) {
      setPhotoError(photoError)
      return
    }
    if (file && file.type.startsWith('image/')) {
      setFormData({
        ...formData,
        photo: URL.createObjectURL(file)
      })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, active: true, href: '/Dashboard' },
    { name: 'Manajemen Anggota', icon: Users, active: false, href: '/members' }
  ]

  const memberStats = {
    totalMembers: members.length,
    eventsActive: 8
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {error && (
        <div className="fixed top-4 right-4 z-50 text-red-500 text-sm p-3 bg-red-50 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      {photoError && (
        <div className="fixed top-16 right-4 z-50 text-red-500 text-sm p-3 bg-red-50 rounded-lg shadow-lg">
          {photoError}
        </div>
      )}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex">
        <div className={`fixed inset-y-0 left-0 w-64 bg-slate-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Syarif Rahman</h3>
              </div>
            </div>
          </div>
          <nav className="mt-6">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name)
                  setIsSidebarOpen(false)
                  if (item.href) router.push(item.href)
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors ${
                  activeTab === item.name ? 'bg-blue-600 border-r-2 border-blue-400' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 flex flex-col lg:ml-64">
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-800">
                Selamat Datang, Obo! Senang bertemu dengan Anda 🥰
              </h1>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Keluar
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">Pusat Komando Anda</h2>
                <p className="text-blue-100 text-lg mb-6">
                  Kelola anggota, acara, dan forum dengan mudah. Tetap ter更新 dengan aktivitas terbaru dan ambil tindakan cepat untuk menjaga komunitas Anda berkembang.
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-300" />
                    <span className="text-sm">{memberStats.totalMembers} Total Anggota</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-orange-300" />
                    <span className="text-sm">3 Fitur Baru</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Total Anggota</p>
                    <p className="text-3xl font-bold text-gray-900">{memberStats.totalMembers}</p>
                    <p className="text-sm text-green-600 mt-1">+8% dari bulan lalu</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6">
            <button 
              onClick={() => setSupportOpen(!supportOpen)}
              className="bg-slate-700 hover:bg-slate-800 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
            {supportOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Dukungan
              </div>
            )}
          </div>

          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg transform transition-all duration-300 scale-100 hover:scale-[1.01] overflow-y-auto max-h-[90vh]">
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Tambah Anggota Baru</h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false)
                        setFormErrors({})
                        setPhotoError(null)
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddMember} className="space-y-6" noValidate>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Foto</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        {formData.photo ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={formData.photo}
                              alt="Preview"
                              className="w-20 h-20 rounded-full object-cover mb-3 border border-gray-200"
                            />
                            <p className="text-sm text-gray-500">Seret atau klik untuk mengganti</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Seret & lepas gambar di sini atau klik untuk mengunggah</p>
                          </div>
                        )}
                        <input
                          type="file"
                          name="photo"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleInputChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="mt-3 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
                        >
                          Pilih Foto
                        </label>
                      </div>
                      {photoError && (
                        <p className="text-sm text-red-500 mt-1">{photoError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 ${
                          formErrors.nama ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.nama && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.nama}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 ${
                          formErrors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Anggota</label>
                      <input
                        type="text"
                        name="nomorAnggota"
                        value={formData.nomorAnggota}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 ${
                          formErrors.nomorAnggota ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.nomorAnggota && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.nomorAnggota}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Tempat Tinggal</label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 ${
                          formErrors.alamat ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.alamat && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.alamat}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                      <input
                        type="tel"
                        name="nomorTelepon"
                        value={formData.nomorTelepon}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 ${
                          formErrors.nomorTelepon ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.nomorTelepon && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.nomorTelepon}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 ${
                          formErrors.password ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.password && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                      )}
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false)
                          setFormErrors({})
                          setPhotoError(null)
                        }}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold shadow-sm"
                        disabled={isLoading}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold shadow-sm flex items-center justify-center ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading && (
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
                        )}
                        {isLoading ? 'Memproses...' : 'Tambah Anggota'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}