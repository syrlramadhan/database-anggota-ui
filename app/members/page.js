'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Home, Users, X, Upload, Plus, Search } from 'lucide-react';

export default function MembersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [membersData, setMembersData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const router = useRouter();

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
    // Hapus semua karakter non-digit
    const numbersOnly = value.replace(/\D/g, '');
    
    // Batasi maksimal 7 digit
    const limitedNumbers = numbersOnly.slice(0, 7);
    
    // Format menjadi XX.XX.XXX
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
      // Jika tanggal kosong, gunakan tanggal hari ini
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    // Jika format sudah DD-MM-YYYY, return as is
    if (dateStr.includes('-') && dateStr.split('-').length === 3) {
      const parts = dateStr.split('-');
      if (parts[0].length === 2) {
        return dateStr; // Sudah format DD-MM-YYYY
      }
    }
    
    // Konversi dari YYYY-MM-DD ke DD-MM-YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
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

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

      const response = await retryFetch('https://dbanggota.syahrulramadhan.site/api/member', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) throw new Error('Struktur respons API tidak valid.');

      console.log('Sample member data:', data.data[0]); // Log sample data untuk debug

      setMembersData(
        data.data
          .filter((member) => member.id_member)
          .map((member) => ({
            id: member.id_member,
            name: member.nama || 'N/A',
            nra: member.nra || 'N/A',
            email: member.email || 'N/A',
            nomorTelepon: member.nomor_hp || 'N/A',
            avatar: (member.nama || 'NA')
              .split(' ')
              .map((word) => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            foto: member.foto || null,
            angkatan: member.angkatan || 'N/A',
            statusKeanggotaan: member.status_keanggotaan || 'N/A',
            jurusan: member.jurusan || 'N/A',
            tanggalDikukuhkan: member.tanggal_dikukuhkan || 'N/A',
            key: member.id_member,
          }))
      );
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal mengambil data anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sesi tidak valid. Silakan login kembali.');
      router.push('/');
      return;
    }
    fetchMembers();
  }, [fetchMembers, router]);

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
    // tanggal_dikukuhkan bersifat optional, tidak wajib diisi
    return errors;
  };

  const validatePhoto = (file) => {
    if (!file) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Format gambar harus JPEG, PNG, atau GIF.';
    if (file.size > MAX_FILE_SIZE) return 'Ukuran gambar maksimum 2MB.';
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError(null);
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
      
      // Tanggal dikukuhkan optional - hanya kirim jika diisi
      if (formData.tanggal_dikukuhkan.trim()) {
        const formattedDate = formatDateToDDMMYYYY(formData.tanggal_dikukuhkan);
        formDataToSend.append('tanggal_dikukuhkan', formattedDate);
      }
      
      // Debug: tampilkan semua data yang akan dikirim
      console.log('FormData yang akan dikirim:', {
        nama: formData.nama.trim(),
        nra: formData.nra.trim(),
        angkatan: formData.angkatan.trim(),
        status_keanggotaan: formData.status_keanggotaan,
        jurusan: formData.jurusan,
        tanggal_dikukuhkan: formData.tanggal_dikukuhkan.trim() ? formatDateToDDMMYYYY(formData.tanggal_dikukuhkan) : 'Tidak diisi'
      });

      if (formData.foto && formData.foto.startsWith('blob:')) {
        const response = await fetch(formData.foto);
        const blob = await response.blob();
        const fotoError = validatePhoto(blob);
        if (fotoError) {
          setPhotoError(fotoError);
          setIsLoading(false);
          return;
        }
        formDataToSend.append('foto', blob, 'profile.jpg');
      }

      const response = await retryFetch('https://dbanggota.syahrulramadhan.site/api/member', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      await response.json();
      await fetchMembers();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal menambah anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setError(null);
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
      
      // Format dan validasi tanggal sebelum dikirim
      const formattedDate = formatDateToDDMMYYYY(formData.tanggal_dikukuhkan);
      console.log('Update - Original date:', formData.tanggal_dikukuhkan);
      console.log('Update - Formatted date:', formattedDate);
      formDataToSend.append('TanggalDikukuhkan', formattedDate);

      if (formData.foto && formData.foto.startsWith('blob:')) {
        const response = await fetch(formData.foto);
        const blob = await response.blob();
        const fotoError = validatePhoto(blob);
        if (fotoError) {
          setPhotoError(fotoError);
          setIsLoading(false);
          return;
        }
        formDataToSend.append('foto', blob, 'profile.jpg');
      }

      const response = await retryFetch(`https://dbanggota.syahrulramadhan.site/api/member/${selectedMemberId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      await response.json();
      await fetchMembers();
      setSelectedMemberId(null);
      resetForm();
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal memperbarui anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      await retryFetch(`https://dbanggota.syahrulramadhan.site/api/member/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchMembers();
      if (selectedMemberId === memberId) {
        setSelectedMemberId(null);
        resetForm();
      }
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal menghapus anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMember = async (member) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      const response = await retryFetch(`https://dbanggota.syahrulramadhan.site/api/member/${member.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const selectedMember = data.data || {};

      setSelectedMemberId(member.id);
      setFormData({
        nama: selectedMember.Nama || '',
        email: selectedMember.Email || '',
        nra: selectedMember.NRA || '',
        nomor_hp: selectedMember.NoHP || '',
        password: '',
        foto: selectedMember.Foto || null,
        angkatan: selectedMember.Angkatan || '',
        status_keanggotaan: selectedMember.StatusKeanggotaan || '',
        jurusan: selectedMember.Jurusan || '',
        tanggal_dikukuhkan: selectedMember.TanggalDikukuhkan ? selectedMember.TanggalDikukuhkan.split('-').reverse().join('-') : '',
      });
      setFormErrors({});
      setPhotoError(null);
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal mengambil data anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto' && files && files[0]) {
      const file = files[0];
      const fotoError = validatePhoto(file);
      if (fotoError) {
        setPhotoError(fotoError);
        return;
      }
      setPhotoError(null);
      setFormData((prev) => ({ ...prev, foto: URL.createObjectURL(file) }));
    } else if (name === 'nra') {
      // Auto-format NRA input
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
    const fotoError = validatePhoto(file);
    if (fotoError) {
      setPhotoError(fotoError);
      return;
    }
    setPhotoError(null);
    setFormData((prev) => ({ ...prev, foto: URL.createObjectURL(file) }));
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

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, active: false, href: '/Dashboard' },
    { name: 'Manajemen Anggota', icon: Users, active: true, href: '/members' },
  ];

  const getAvatarColor = (index) => {
    const colors = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'];
    return colors[index % colors.length];
  };

  const filteredMembers = membersData.filter((member) =>
    ['name', 'nra', 'angkatan', 'status_keanggotaan', 'jurusan', 'tanggal_dikukuhkan'].some((key) =>
      member[key]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (fotoError) {
      const timer = setTimeout(() => setPhotoError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [fotoError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {error && (
        <div className="fixed top-4 right-4 z-50 text-red-500 text-sm p-3 bg-red-50 rounded-lg shadow-lg border border-red-200 max-w-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600" aria-label="Tutup pesan error">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {fotoError && (
        <div className="fixed top-16 right-4 z-50 text-red-500 text-sm p-3 bg-red-50 rounded-lg shadow-lg border border-red-200 max-w-md">
          <div className="flex items-center justify-between">
            <span>{fotoError}</span>
            <button onClick={() => setPhotoError(null)} className="ml-2 text-red-400 hover:text-red-600" aria-label="Tutup pesan error foto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Buka/tutup sidebar"
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
                  setIsSidebarOpen(false);
                  if (item.href) router.push(item.href);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors ${item.active ? 'bg-blue-600 border-r-2 border-blue-400' : ''}`}
                aria-label={`Navigasi ke ${item.name}`}
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Tambah anggota baru"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative" aria-label="Notifikasi">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </header>
          <div className="bg-white px-6 py-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari anggota berdasarkan nama, NRA, angkatan, status, atau jurusan"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                aria-label="Cari anggota"
              />
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Nama</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">NRA</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Nomor Telepon</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Angkatan</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Jurusan</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Tanggal Dikukuhkan</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="9" className="py-8 px-6 text-center text-sm text-gray-500">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                              <span>Memuat data...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-8 px-6 text-center text-sm text-gray-500">
                            {searchTerm ? 'Tidak ada anggota yang cocok dengan pencarian' : 'Tidak ada anggota ditemukan'}
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((member, index) => (
                          <tr
                            key={member.key}
                            className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedMemberId === member.id ? 'bg-blue-50 border-blue-200' : ''}`}
                            onClick={() => handleSelectMember(member)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSelectMember(member);
                            }}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                {member.foto ? (
                                  <img
                                    src={`https://dbanggota.syahrulramadhan.site/uploads/${member.foto}`}
                                    alt={`Foto ${member.name}`}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(index)} ${member.foto ? 'hidden' : ''}`}
                                >
                                  {member.avatar}
                                </div>
                                <span className="text-sm text-gray-900 font-medium">{member.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">{member.nra}</td>
                            <td className="py-4 px-6 text-sm text-blue-600">{member.email}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{member.nomorTelepon}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{member.angkatan}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{getStatusLabel(member.statusKeanggotaan)}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{member.jurusan}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{member.tanggalDikukuhkan}</td>
                            <td className="py-4 px-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMember(member.id);
                                }}
                                className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
                                disabled={isLoading}
                                aria-label={`Hapus anggota ${member.name}`}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {selectedMemberId && (
              <div className="w-full sm:w-96 bg-white border-l shadow-lg overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Detail Anggota</h2>
                    <button
                      onClick={() => {
                        setSelectedMemberId(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Tutup detail anggota"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {(() => {
                    const selectedMember = filteredMembers.find((member) => member.id === selectedMemberId);
                    if (!selectedMember) return null;
                    return (
                      <form onSubmit={handleUpdateMember} className="space-y-4" noValidate>
                        <div className="flex justify-center mb-6">
                          {formData.foto ? (
                            <img
                              src={formData.foto}
                              alt="Pratinjau"
                              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : selectedMember.foto ? (
                            <img
                              src={`https://dbanggota.syahrulramadhan.site/storage/photos/${selectedMember.foto}`}
                              alt={`Foto ${selectedMember.name}`}
                              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-medium border-4 border-gray-200 shadow-sm ${getAvatarColor(selectedMemberId - 1)} ${
                              formData.foto || selectedMember.foto ? 'hidden' : ''
                            }`}
                          >
                            {selectedMember.avatar}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Profil</label>
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            aria-label="Area unggah foto"
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
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                          <input
                            name="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.nama ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                            aria-invalid={formErrors.nama ? 'true' : 'false'}
                            aria-describedby={formErrors.nama ? 'nama-error' : undefined}
                          />
                          {formErrors.nama && (
                            <p id="nama-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.nama}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Anggota (NRA)</label>
                          <input
                            name="nra"
                            value={formData.nra}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.nra ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                            aria-invalid={formErrors.nra ? 'true' : 'false'}
                            aria-describedby={formErrors.nra ? 'nra-error' : undefined}
                            placeholder="Ketik angka, format otomatis: XX.XX.XXX"
                            maxLength="9"
                          />
                          {!formErrors.nra && (
                            <p className="text-xs text-gray-500 mt-1">Format akan otomatis menjadi XX.XX.XXX saat Anda mengetik angka</p>
                          )}
                          {formErrors.nra && (
                            <p id="nra-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.nra}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Angkatan</label>
                          <input
                            name="angkatan"
                            value={formData.angkatan}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.angkatan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                            aria-invalid={formErrors.angkatan ? 'true' : 'false'}
                            aria-describedby={formErrors.angkatan ? 'angkatan-error' : undefined}
                            placeholder="contoh: ABCD"
                            maxLength={4}
                          />
                          {formErrors.angkatan && (
                            <p id="angkatan-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.angkatan}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Maksimum 4 karakter</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Status Keanggotaan</label>
                          <select
                            name="status_keanggotaan"
                            value={formData.status_keanggotaan}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.status_keanggotaan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                            aria-invalid={formErrors.status_keanggotaan ? 'true' : 'false'}
                            aria-describedby={formErrors.status_keanggotaan ? 'status_keanggotaan-error' : undefined}
                          >
                            <option value="">Pilih status</option>
                            {ALLOWED_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                          {formErrors.status_keanggotaan && (
                            <p id="status_keanggotaan-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.status_keanggotaan}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Jurusan</label>
                          <select
                            name="jurusan"
                            value={formData.jurusan}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.jurusan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                            aria-invalid={formErrors.jurusan ? 'true' : 'false'}
                            aria-describedby={formErrors.jurusan ? 'jurusan-error' : undefined}
                          >
                            <option value="">Pilih jurusan</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="System">System</option>
                          </select>
                          {formErrors.jurusan && (
                            <p id="jurusan-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.jurusan}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Dikukuhkan</label>
                          <input
                            name="tanggal_dikukuhkan"
                            type="date"
                            value={formData.tanggal_dikukuhkan}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.tanggal_dikukuhkan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                            aria-invalid={formErrors.tanggal_dikukuhkan ? 'true' : 'false'}
                            aria-describedby={formErrors.tanggal_dikukuhkan ? 'tanggal_dikukuhkan-error' : undefined}
                          />
                          {formErrors.tanggal_dikukuhkan && (
                            <p id="tanggal_dikukuhkan-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.tanggal_dikukuhkan}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD (akan dikonversi ke DD-MM-YYYY)</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi Baru (Opsional)</label>
                          <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            placeholder="Kosongkan jika tidak ingin mengubah"
                            aria-invalid={formErrors.password ? 'true' : 'false'}
                            aria-describedby={formErrors.password ? 'password-error' : undefined}
                          />
                          {formErrors.password && (
                            <p id="password-error" className="text-sm text-red-500 mt-1 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {formErrors.password}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                        </div>
                        <div className="flex space-x-3 pt-6 border-t">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMemberId(null);
                              resetForm();
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                            disabled={isLoading}
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className={`flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold shadow-sm flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                          >
                            {isLoading && (
                              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            )}
                            {isLoading ? 'Memproses...' : 'Perbarui Anggota'}
                          </button>
                        </div>
                      </form>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Tambah Anggota Baru</h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                      aria-label="Tutup modal tambah anggota"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Informasi Workflow Token */}
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

                  <form onSubmit={handleAddMember} className="space-y-6" noValidate>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Profil</label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        aria-label="Area unggah foto"
                      >
                        {formData.foto ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={formData.foto}
                              alt="Pratinjau"
                              className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
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
                          id="foto-upload-add"
                        />
                        <label
                          htmlFor="foto-upload-add"
                          className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
                        >
                          {formData.foto ? 'Ganti Foto' : 'Pilih Foto'}
                        </label>
                        <p className="text-xs text-gray-400 mt-2">Format: JPEG, PNG, GIF (Max: 2MB)</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.nama ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        required
                        aria-invalid={formErrors.nama ? 'true' : 'false'}
                        aria-describedby={formErrors.nama ? 'nama-error-add' : undefined}
                        placeholder="Masukkan nama lengkap"
                      />
                      {formErrors.nama && (
                        <p id="nama-error-add" className="text-sm text-red-500 mt-1 flex items-center">
                          <span className="w-4 h-4 mr-1">⚠️</span>
                          {formErrors.nama}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nomor Anggota (NRA) <span className="text-red-500">*</span>
                      </label> 
                      <input
                        type="text"
                        name="nra"
                        value={formData.nra}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.nra ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        required
                        aria-invalid={formErrors.nra ? 'true' : 'false'}
                        aria-describedby={formErrors.nra ? 'nra-error-add' : undefined}
                        placeholder="Ketik angka, format otomatis: XX.XX.XXX"
                        maxLength="9"
                      />
                      {!formErrors.nra && (
                        <p className="text-xs text-gray-500 mt-1">Format akan otomatis menjadi XX.XX.XXX saat Anda mengetik angka</p>
                      )}
                      {formErrors.nra && (
                        <p id="nra-error-add" className="text-sm text-red-500 mt-1 flex items-center">
                          <span className="w-4 h-4 mr-1">⚠️</span>
                          {formErrors.nra}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Angkatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="angkatan"
                        value={formData.angkatan}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.angkatan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        required
                        aria-invalid={formErrors.angkatan ? 'true' : 'false'}
                        aria-describedby={formErrors.angkatan ? 'angkatan-error-add' : undefined}
                        placeholder="contoh: ABCD"
                        maxLength={4}
                      />
                      {formErrors.angkatan && (
                        <p id="angkatan-error-add" className="text-sm text-red-500 mt-1 flex items-center">
                          <span className="w-4 h-4 mr-1">⚠️</span>
                          {formErrors.angkatan}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Maksimum 4 karakter</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Keanggotaan <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status_keanggotaan"
                        value={formData.status_keanggotaan}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.status_keanggotaan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        required
                        aria-invalid={formErrors.status_keanggotaan ? 'true' : 'false'}
                        aria-describedby={formErrors.status_keanggotaan ? 'status_keanggotaan-error-add' : undefined}
                      >
                        <option value="">Pilih status</option>
                        {ALLOWED_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                      {formErrors.status_keanggotaan && (
                        <p id="status_keanggotaan-error-add" className="text-sm text-red-500 mt-1 flex items-center">
                          <span className="w-4 h-4 mr-1">⚠️</span>
                          {formErrors.status_keanggotaan}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jurusan <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jurusan"
                        value={formData.jurusan}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.jurusan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        required
                        aria-invalid={formErrors.jurusan ? 'true' : 'false'}
                        aria-describedby={formErrors.jurusan ? 'jurusan-error-add' : undefined}
                      >
                        <option value="">Pilih jurusan</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="System">System</option>
                      </select>
                      {formErrors.jurusan && (
                        <p id="jurusan-error-add" className="text-sm text-red-500 mt-1 flex items-center">
                          <span className="w-4 h-4 mr-1">⚠️</span>
                          {formErrors.jurusan}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Dikukuhkan <span className="text-gray-500">(Opsional)</span>
                      </label>
                      <input
                        type="date"
                        name="tanggal_dikukuhkan"
                        value={formData.tanggal_dikukuhkan}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.tanggal_dikukuhkan ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        aria-invalid={formErrors.tanggal_dikukuhkan ? 'true' : 'false'}
                        aria-describedby={formErrors.tanggal_dikukuhkan ? 'tanggal_dikukuhkan-error-add' : undefined}
                      />
                      {formErrors.tanggal_dikukuhkan && (
                        <p id="tanggal_dikukuhkan-error-add" className="text-sm text-red-500 mt-1 flex items-center">
                          <span className="w-4 h-4 mr-1">⚠️</span>
                          {formErrors.tanggal_dikukuhkan}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD (akan dikonversi ke DD-MM-YYYY)</p>
                    </div>
                    <div className="flex space-x-3 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                        }}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold shadow-sm flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                      >
                        {isLoading && (
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
  );
}