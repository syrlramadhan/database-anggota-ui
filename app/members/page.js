'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import MembersTable from '../../components/members/MembersTable';
import AddMemberForm from '../../components/members/AddMemberForm';
import Modal from '../../components/ui/Modal';

export default function MembersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [membersData, setMembersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

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
                // If it's just a filename, construct the full URL
                fotoUrl = `https://dbanggota.syahrulramadhan.site/uploads/${member.foto}`;
              }
            }

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
              status_keanggotaan: member.status_keanggotaan || 'N/A',
              jurusan: member.jurusan || 'N/A',
              tanggal_dikukuhkan: member.tanggal_dikukuhkan || 'N/A',
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

  const handleEditMember = (member) => {
    // TODO: Implement edit functionality
    console.log('Edit member:', member);
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus anggota ${member.name}?`)) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

      await retryFetch(`https://dbanggota.syahrulramadhan.site/api/member/${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchMembers();
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal menghapus anggota.');
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

      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await retryFetch('https://dbanggota.syahrulramadhan.site/api/member', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      await fetchMembers();
      setShowAddModal(false);
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal menambah anggota.');
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
          <h1 className="text-2xl font-bold">Manajemen Anggota</h1>
          <p className="text-blue-100 mt-2">Kelola data anggota organisasi dengan mudah</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <MembersTable
          members={membersData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddMember={handleAddMember}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          isLoading={isLoading}
        />
      </div>

      {/* Add Member Modal */}
      <AddMemberForm
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSubmit={handleMemberAdded}
        isLoading={isLoading}
      />
    </MainLayout>
  );
}