'use client';

import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function MembersTable({ 
  members = [], 
  searchTerm, 
  onSearchChange, 
  onAddMember, 
  onEditMember, 
  onDeleteMember,
  isLoading = false 
}) {
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

  const filteredMembers = searchTerm.trim() === '' 
    ? members 
    : members.filter((member) =>
        ['name', 'nra', 'angkatan', 'status_keanggotaan', 'jurusan', 'tanggal_dikukuhkan'].some((key) =>
          member[key]?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button onClick={onAddMember} className="whitespace-nowrap">
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Anggota
            </Button>
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
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" className="py-8 px-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mb-4"></div>
                    <p className="text-gray-500">Memuat data anggota...</p>
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
                  key={member.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {member.foto ? (
                        <div className="relative">
                          <img
                            src={member.foto}
                            alt={`Foto ${member.name}`}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              console.log('Failed to load image:', member.foto);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              // Hide the avatar when image loads successfully
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'none';
                              }
                            }}
                          />
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(index)}`}
                            style={{ display: 'none' }}
                          >
                            {member.name && member.name !== 'N/A' ? member.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(index)}`}
                        >
                          {member.name && member.name !== 'N/A' ? member.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-gray-900 font-medium block truncate">
                          {member.name && member.name !== 'N/A' ? member.name : 'Nama tidak tersedia'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{member.nra}</td>
                  <td className="py-4 px-6 text-sm text-blue-600">{member.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{member.nomor_hp}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{member.angkatan}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{getStatusLabel(member.status_keanggotaan)}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{member.jurusan}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{member.tanggal_dikukuhkan}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit anggota"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
    </div>
  );
}
