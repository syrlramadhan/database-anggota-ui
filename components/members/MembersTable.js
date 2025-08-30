'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, Key, Copy, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import EditMemberModal from './EditMemberModal';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useAuth } from '../../hooks/useAuth';
import config from '../../config';

export default function MembersTable({ 
  members = [], 
  searchTerm, 
  onSearchChange, 
  onAddMember, 
  onEditMember, 
  onDeleteMember,
  onDirectDeleteMember,
  isLoading = false
}) {
  const { canAddMembers, isAdmin, getUserRole, canViewMembers } = useAuthorization();
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [tokenPopup, setTokenPopup] = useState({ show: false, token: '', memberName: '' });
  const [copyNotification, setCopyNotification] = useState({ show: false, type: '', message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, member: null });
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [selfDeleteRedirect, setSelfDeleteRedirect] = useState({ show: false });
  
  // Auto hide copy notification after 3 seconds
  React.useEffect(() => {
    if (copyNotification.show) {
      const timer = setTimeout(() => {
        setCopyNotification({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copyNotification.show]);

  const showCopyNotification = (type, message) => {
    setCopyNotification({ show: true, type, message });
  };
  const getStatusLabel = (status) => {
    const statusMap = {
      'anggota': 'Anggota',
      'bph': 'BPH',
      'alb': 'ALB',
      'dpo': 'DPO',
      'bp': 'BP'
    };
    return statusMap[status] || status;
  };

  const getAvatarColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-gray-500'
    ];
    return colors[index % colors.length];
  };

  const getMemberPhotoUrl = (foto) => {
    if (!foto || foto === 'N/A' || foto === 'Foto') return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads/') || foto.includes('uploads/')) {
      const fileName = foto.replace('/uploads/', '').replace('uploads/', '');
      return config.endpoints.uploads(fileName);
    }
    return config.endpoints.uploads(foto);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (memberId, memberData) => {
    await onEditMember(memberId, memberData);
    setEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleShowToken = (token, memberName) => {
    setTokenPopup({ show: true, token, memberName });
  };

  const handleCopyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      showCopyNotification('success', 'Token berhasil disalin!');
    } catch (err) {
      console.error('Gagal menyalin token:', err);
      showCopyNotification('error', 'Gagal menyalin token');
    }
  };

  const closeTokenPopup = () => {
    setTokenPopup({ show: false, token: '', memberName: '' });
  };

  // Check if member is current user
  const isCurrentUser = (member) => {
    if (!user || !member) return false;
    return user.id === member.id_member || user.nra === member.nra || user.email === member.email;
  };

  // Sort members to put current user first, then others sorted by NRA
  const sortMembersWithCurrentUserFirst = (membersList) => {
    if (!user) return membersList;
    
    const currentUserMember = membersList.find(member => isCurrentUser(member));
    const otherMembers = membersList.filter(member => !isCurrentUser(member));
    
    // Sort other members by NRA
    const sortedOtherMembers = otherMembers.sort((a, b) => {
      const nraA = a.nra || '';
      const nraB = b.nra || '';
      return nraA.localeCompare(nraB);
    });
    
    return currentUserMember ? [currentUserMember, ...sortedOtherMembers] : sortedOtherMembers;
  };

  // Handle delete with confirmation for current user
  const handleDeleteMember = (member) => {
    if (isCurrentUser(member)) {
      // Show confirmation modal for current user
      setDeleteConfirmModal({ show: true, member });
      setDeleteConfirmName('');
    } else {
      // Direct delete for other members - pass the whole member object
      onDeleteMember(member);
    }
  };

  const handleConfirmDelete = () => {
    const member = deleteConfirmModal.member;
    if (member && deleteConfirmName.trim() === member.name.trim()) {
      const isSelfDelete = isCurrentUser(member);
      
      // Close the confirmation modal first
      setDeleteConfirmModal({ show: false, member: null });
      setDeleteConfirmName('');
      
      // Execute the delete using appropriate function
      if (isSelfDelete && onDirectDeleteMember) {
        onDirectDeleteMember(member);
      } else {
        onDeleteMember(member);
      }
      
      // If it's self delete, show redirect popup after a short delay
      if (isSelfDelete) {
        setTimeout(() => {
          setSelfDeleteRedirect({ show: true });
        }, 1000); // Small delay to allow the delete to process
      }
    }
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModal({ show: false, member: null });
    setDeleteConfirmName('');
  };

  const handleRedirectToLogin = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/';
  };

  const filteredMembers = searchTerm.trim() === '' 
    ? sortMembersWithCurrentUserFirst(members)
    : sortMembersWithCurrentUserFirst(
        members.filter((member) =>
          ['name', 'nra', 'angkatan', 'status_keanggotaan', 'jurusan', 'tanggal_dikukuhkan'].some((key) =>
            member[key]?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daftar Anggota</h2>
            <p className="text-sm text-gray-600 mt-1">
              Kelola data anggota organisasi
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NRA, angkatan..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent w-full sm:w-80"
              />
            </div>
            {canAddMembers && (
              <Button onClick={onAddMember} className="whitespace-nowrap">
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Anggota
              </Button>
            )}
            {!canAddMembers && (
              <div className="text-sm text-gray-500 flex items-center">
                <span className="px-3 py-2 bg-gray-100 rounded-lg">
                  Role: {getUserRole} (View Only)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Nama</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">NRA</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Nomor HP</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Angkatan</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Jurusan</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Tanggal Dikukuhkan</th>
              {/* Kolom Token hanya muncul untuk DPO dan BPH */}
              {isAdmin && (
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Token</th>
              )}
              {/* Kolom Aksi hanya muncul untuk DPO dan BPH */}
              {isAdmin && (
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={isAdmin ? "10" : "8"} className="py-8 px-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mb-4"></div>
                    <p className="text-gray-500">Memuat data anggota...</p>
                  </div>
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? "10" : "8"} className="py-8 px-6 text-center text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada anggota yang cocok dengan pencarian' : 'Tidak ada anggota ditemukan'}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member, index) => {
                const isCurrentUserRow = isCurrentUser(member);
                return (
                  <tr
                    key={member.id}
                    className={`border-b transition-all duration-200 ${
                      isCurrentUserRow 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {getMemberPhotoUrl(member.foto) ? (
                          <img
                            src={getMemberPhotoUrl(member.foto)}
                            alt={`Foto ${member.name}`}
                            className={`w-8 h-8 rounded-full object-cover border-2 ${
                              isCurrentUserRow 
                                ? 'border-blue-400 shadow-md' 
                                : 'border-gray-200'
                            }`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 ${
                              isCurrentUserRow 
                                ? 'border-blue-400 shadow-md bg-blue-500' 
                                : `border-gray-200 ${getAvatarColor(index)}`
                            }`}
                          >
                            {member.name && member.name !== 'N/A' ? member.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium block truncate ${
                              isCurrentUserRow 
                                ? 'text-blue-900' 
                                : 'text-gray-900'
                            }`}>
                              {member.name && member.name !== 'N/A' ? member.name : 'Nama tidak tersedia'}
                            </span>
                            {isCurrentUserRow && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-800 font-medium' : 'text-gray-600'
                    }`}>
                      {member.nra}
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-700 font-medium' : 'text-blue-600'
                    }`}>
                      {member.email}
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-800 font-medium' : 'text-gray-600'
                    }`}>
                      {member.nomor_hp}
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-800 font-medium' : 'text-gray-600'
                    }`}>
                      {member.angkatan}
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-800 font-medium' : 'text-gray-600'
                    }`}>
                      {getStatusLabel(member.status_keanggotaan)}
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-800 font-medium' : 'text-gray-600'
                    }`}>
                      {member.jurusan}
                    </td>
                    <td className={`py-4 px-6 text-sm ${
                      isCurrentUserRow ? 'text-blue-800 font-medium' : 'text-gray-600'
                    }`}>
                      {member.tanggal_dikukuhkan}
                    </td>
                  
                  {/* Kolom Token - hanya untuk DPO dan BPH */}
                  {isAdmin && (
                    <td className="py-4 px-6 text-sm">
                      {member.login_token ? (
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleShowToken(member.login_token, member.name)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Lihat token"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No token</span>
                        </div>
                      )}
                    </td>
                  )}

                  {/* Kolom Aksi - hanya untuk DPO dan BPH */}
                  {isAdmin && (
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit anggota"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {member.status_keanggotaan !== 'bp' ? (
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus anggota"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1 text-gray-400 cursor-not-allowed rounded"
                            title="Tidak dapat menghapus Badan Pendiri"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!isLoading && filteredMembers.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Menampilkan {filteredMembers.length} dari {members.length} anggota
            </span>
            <span>
              {searchTerm && `Hasil pencarian untuk "${searchTerm}"`}
            </span>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSubmit={handleEditSubmit}
      />

      {/* Token Popup Modal */}
      {tokenPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Token Anggota</h3>
              </div>
              <button
                onClick={closeTokenPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Info */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Token untuk: <span className="font-medium text-gray-900">{tokenPopup.memberName}</span>
              </p>
            </div>

            {/* Token Display */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <div className="relative">
                <textarea
                  value={tokenPopup.token}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none"
                  rows="4"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={closeTokenPopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => handleCopyToken(tokenPopup.token)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Token</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Token Notification */}
      {copyNotification.show && (
        <div className="fixed top-4 right-4 z-[70] max-w-sm w-full">
          <div className={`
            rounded-lg shadow-lg border p-4 transition-all duration-300 transform
            ${copyNotification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {copyNotification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {copyNotification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setCopyNotification({ show: false, type: '', message: '' })}
                  className={`
                    rounded-md inline-flex transition-colors duration-200
                    ${copyNotification.type === 'success' 
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Hapus Akun Anda
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Anda akan menghapus akun Anda sendiri. Tindakan ini tidak dapat dibatalkan.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Untuk konfirmasi, ketik nama Anda: <span className="font-semibold text-gray-900">{deleteConfirmModal.member?.name}</span>
                </p>
                
                <Input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Ketik nama Anda"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={closeDeleteConfirmModal}
                  variant="secondary"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmName.trim() !== deleteConfirmModal.member?.name.trim()}
                  className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                    deleteConfirmName.trim() === deleteConfirmModal.member?.name.trim()
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Ya, Hapus Akun Saya
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self Delete Redirect Modal */}
      {selfDeleteRedirect.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Akun Berhasil Dihapus
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Akun Anda telah berhasil dihapus dari sistem. Anda akan diarahkan ke halaman login.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Ingin membuat akun baru?</span><br />
                    Hubungi Admin (DPO/BPH) untuk mendaftarkan akun baru Anda.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleRedirectToLogin}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  Ke Halaman Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
