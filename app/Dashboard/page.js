'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, UserPlus } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import { useAuthorization } from '../../hooks/useAuthorization';
import config from '../../config';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { canAddMembers } = useAuthorization();

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
      const response = await fetch(`${config.api.url}${config.endpoints.member}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
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

      setMembers(data.data.filter(member => member.id_member));
    } catch (err) {
      setError(err.message.includes('login kembali') ? err.message : 'Gagal mengambil data anggota.');
      if (err.message.includes('login kembali')) router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const totalMembers = members.length;
  const bphMembers = members.filter(member => member.status_keanggotaan === 'bph').length;
  const newMembers = members.filter(member => member.status_keanggotaan === 'anggota').length;

  const stats = [
    {
      title: 'Total Anggota',
      value: totalMembers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total BPH',
      value: bphMembers,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '0%',
      changeType: 'neutral'
    },
    {
      title: 'Total Anggota Baru',
      value: newMembers,
      icon: UserPlus,
      color: 'bg-orange-500',
      change: '+25%',
      changeType: 'increase'
    }
  ];

  const recentMembers = members
    .sort((a, b) => new Date(b.tanggal_dikukuhkan || 0) - new Date(a.tanggal_dikukuhkan || 0))
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Selamat Datang di Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Kelola data anggota dengan mudah dan efisien
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' :
                        stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">dari bulan lalu</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Members */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Anggota Terbaru
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/members')}
                >
                  Lihat Semua
                </Button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat data...</p>
                </div>
              ) : recentMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada anggota terdaftar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMembers.map((member) => (
                    <div key={member.id_member} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {member.nama?.charAt(0)?.toUpperCase() || 'N'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.nama || 'Nama tidak tersedia'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {member.nra || 'NRA tidak tersedia'} • {member.angkatan || 'Angkatan tidak tersedia'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {member.tanggal_dikukuhkan ? 
                            new Date(member.tanggal_dikukuhkan).toLocaleDateString('id-ID') : 
                            'Tanggal tidak tersedia'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Aksi Cepat
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {canAddMembers && (
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push('/members')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Anggota Baru
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/members')}
              >
                <Users className="w-4 h-4 mr-2" />
                Lihat Semua Anggota
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/settings')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Pengaturan Sistem
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
