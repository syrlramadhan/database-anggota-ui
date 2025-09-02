'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import MembersTable from '../../components/members/MembersTable';
import AddMemberForm from '../../components/members/AddMemberForm';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useAuth } from '../../hooks/useAuth';
import config from '../../config';
import Modal from '../../components/ui/Modal';

export default function MembersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [membersData, setMembersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, member: null });
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const { canAddMembers, canViewMembers, isAdmin, getUserRole } = useAuthorization();

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

  // Redirect if user doesn't have permission to view members (only after auth is loaded)
  useEffect(() => {
    // if (!authLoading && !canViewMembers) {
    //   router.push('/Dashboard');
    // }
  }, [canViewMembers, authLoading, router]);

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

      const response = await retryFetch(`${config.api.url}${config.endpoints.member}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) throw new Error('Struktur respons API tidak valid.');

      setMembersData(
        data.data
          .filter((member) => member.id_member)
          .map((member) => {
            // Clean and validate nama
            let cleanName = member.nama || 'N/A';
            if (typeof cleanName === 'string') {
              cleanName = cleanName.trim();
              // Remove any "Foto" text that might accidentally be in the name
              if (cleanName.toLowerCase().includes('foto')) {
                cleanName = cleanName.replace(/foto\s*/gi, '').trim();
              }
              // If name becomes empty after cleaning, set to N/A
              if (!cleanName) cleanName = 'N/A';
            }

            // Process foto URL
            let fotoUrl = null;
            if (member.foto && 
                member.foto !== 'N/A' && 
                member.foto !== 'Foto' && 
                typeof member.foto === 'string' &&
                member.foto.trim() !== '') {
              
              // If it's already a full URL, use it
              if (member.foto.startsWith('http')) {
                fotoUrl = member.foto;
              } else {
                // If it's just a filename, construct the full URL using config
                fotoUrl = config.endpoints.uploads(member.foto);
              }
            }

            // Pastikan status ALB tetap ada dalam mapping data
            return {
              id: member.id_member,
              name: cleanName,
              nra: member.nra || 'N/A',
              email: member.email || 'N/A',
              nomor_hp: member.nomor_hp || 'N/A',
              avatar: (cleanName && cleanName !== 'N/A')
                ? cleanName.split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'NA',
              foto: fotoUrl,
              angkatan: member.angkatan || 'N/A',
              // Pastikan semua status termasuk ALB tetap ada
              status_keanggotaan: member.status_keanggotaan || 'N/A', // ALB akan tetap ada di sini
              jurusan: member.jurusan || 'N/A',
              tanggal_dikukuhkan: member.tanggal_dikukuhkan || 'N/A',
              login_token: member.login_token || null,
            };
          })
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

  const handleAddMember = () => {
    setShowAddModal(true);
  };

  const handleEditMember = async (memberId, memberData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      // Create FormData and add the member data
      const submitData = new FormData();
      
      // Add all fields from memberData to FormData
      Object.keys(memberData).forEach(key => {
        if (memberData[key] !== null && memberData[key] !== undefined && memberData[key] !== '') {
          submitData.append(key, memberData[key]);
        }
      });

      console.log('Updating member with ID:', memberId);
      console.log('Member data:', memberData);

      const response = await fetch(`${config.api.url}${config.endpoints.member}/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate anggota');
      }

      const result = await response.json();
      console.log('Update response:', result);
      
      // Update local state with the correct state setter
      setMembersData(prev => prev.map(member => 
        member.id === memberId ? { ...member, ...memberData } : member
      ));
      
      // Refresh data from server to ensure consistency
      await fetchMembers();
      
      showNotification('success', 'Data anggota berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating member:', error);
      showNotification('error', error.message || 'Gagal mengupdate anggota');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const isCurrentUser = (member) => {
    if (!user || !member) return false;
    return (
      member.id === user.id ||
      member.nra === user.nra ||
      member.email === user.email ||
      member.name === user.nama
    );
  };

  const handleDeleteMember = async (member) => {
    // Skip parent confirmation popup for current user - let MembersTable handle it completely
    if (!isCurrentUser(member)) {
      setConfirmDelete({ show: true, member });
    }
    // For current user, do nothing here - MembersTable will handle everything
  };

  const confirmDeleteMember = async () => {
    const member = confirmDelete.member;
    setConfirmDelete({ show: false, member: null });

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      await retryFetch(`${config.api.url}${config.endpoints.member}/${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchMembers();
      showNotification('success', `Anggota ${member.name} berhasil dihapus!`);
    } catch (err) {
      const errorMessage = err.message.includes('login kembali') ? err.message : 'Gagal menghapus anggota.';
      showNotification('error', errorMessage);
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const directDeleteMember = async (member) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      await retryFetch(`${config.api.url}${config.endpoints.member}/${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchMembers();
      showNotification('success', `Akun Anda berhasil dihapus!`);
    } catch (err) {
      const errorMessage = err.message.includes('login kembali') ? err.message : 'Gagal menghapus akun.';
      showNotification('error', errorMessage);
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
  };

  const handleMemberAdded = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      console.log('Form data yang akan dikirim:', formData);

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Handle regular form fields
      Object.keys(formData).forEach(key => {
        if (key === 'foto' || key === 'fotoFile') {
          // Skip foto fields, we'll handle them separately
          return;
        }
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Handle foto separately - use actual file if exists
      if (formData.fotoFile) {
        submitData.append('foto', formData.fotoFile);
        console.log('Foto berhasil ditambahkan:', formData.fotoFile.name, formData.fotoFile.size, 'bytes');
      } else if (formData.foto && formData.foto.startsWith('data:image/')) {
        try {
          // Fallback: Convert base64 to blob if fotoFile not available
          const response = await fetch(formData.foto);
          const blob = await response.blob();
          
          // Create a proper file name based on the image type
          const mimeType = formData.foto.split(',')[0].split(':')[1].split(';')[0];
          const extension = mimeType.split('/')[1];
          const fileName = `profile.${extension}`;
          
          submitData.append('foto', blob, fileName);
          console.log('Foto berhasil dikonversi ke blob:', blob.size, 'bytes');
        } catch (fotoError) {
          console.warn('Error processing foto:', fotoError);
          // Continue without foto if there's an error
        }
      } else {
        console.log('Tidak ada foto yang dipilih atau format tidak valid');
      }

      console.log('Data yang akan dikirim ke API:');
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1] instanceof Blob ? `File: ${pair[1].size} bytes` : pair[1]);
      }

      const response = await retryFetch(`${config.api.url}${config.endpoints.member}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const responseData = await response.json();
      console.log('Response dari API:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Gagal menambah anggota');
      }

      await fetchMembers();
      setShowAddModal(false);
      
      // Show success message
      showNotification('success', 'Anggota berhasil ditambahkan!');
      
    } catch (err) {
      console.error('Error adding member:', err);
      const errorMessage = err.message.includes('login kembali') 
        ? err.message 
        : `Gagal menambah anggota: ${err.message}`;
      setError(errorMessage);
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Show loading state while authentication is loading
  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat halaman...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Error Notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 text-red-500 text-sm p-3 bg-red-50 rounded-lg shadow-lg border border-red-200 max-w-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Manajemen Anggota</h1>
              <p className="text-blue-100 mt-2">Kelola data anggota organisasi dengan mudah</p>
            </div>
            {/* Role Badge */}
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="text-sm font-medium">
                Role: {getUserRole}
              </div>
              <div className="text-xs text-blue-100">
                {isAdmin ? 'Full Access' : 'View Only'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Informasi Akses untuk Anggota Biasa */}
        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Mode Tampilan Saja
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Anda memiliki akses untuk melihat data anggota. Untuk menambah, mengedit, atau menghapus anggota, hubungi DPO atau BPH.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <MembersTable
          members={membersData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddMember={handleAddMember}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onDirectDeleteMember={directDeleteMember}
          isLoading={isLoading}
        />
      </div>

      {/* Add Member Modal - Only show if user can add members */}
      {canAddMembers && (
        <AddMemberForm
          isOpen={showAddModal}
          onClose={handleModalClose}
          onSubmit={handleMemberAdded}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setConfirmDelete({ show: false, member: null })}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Konfirmasi Hapus Anggota
                </h3>
                <p className="text-sm text-gray-600">
                  Apakah Anda yakin ingin menghapus anggota{' '}
                  <span className="font-medium text-gray-900">
                    {confirmDelete.member?.name}
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmDelete({ show: false, member: null })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteMember}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] max-w-sm w-full">
          <div className={`
            rounded-lg shadow-lg border p-4 transition-all duration-300 transform
            ${notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className={`
                    rounded-md inline-flex transition-colors duration-200
                    ${notification.type === 'success' 
                      ? 'text-green-400 hover:text-green-600' 
                      : 'text-red-400 hover:text-red-600'
                    }
                  `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}