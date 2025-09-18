'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';

const retryFetch = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (i === maxRetries - 1) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const getJurusanLabel = (jurusanCode) => {
  const jurusanMap = {
    'J001': 'Front-end',
    'J002': 'Back-end',
    'J003': 'System'
  };
  return jurusanMap[jurusanCode] || jurusanCode;
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const checkTokenAndRedirect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return false;
    }
    return true;
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user'); // Also remove user data if exists
    setUser(null);
    router.push('/');
  }, [router]);

  const fetchUserProfile = useCallback(async () => {
    if (!checkTokenAndRedirect()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await retryFetch(`${config.api.url}${config.endpoints.memberProfile}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      // Parse JSON response with error handling
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response in useAuth:', jsonError);
        throw new Error('Server mengembalikan response yang tidak valid');
      }

      if (data.data) {
        const userData = {
          id: data.data.id_member || data.data.id,
          nama: data.data.nama || 'Unknown User',
          nra: data.data.nra || 'N/A',
          email: data.data.email || 'N/A',
          foto: data.data.foto || '',
          role: data.data.role || 'anggota',
          status_keanggotaan: data.data.status_keanggotaan || 'aktif',
          jurusan: getJurusanLabel(data.data.jurusan) || 'N/A',
          angkatan: data.data.angkatan || 'N/A',
          nomor_hp: data.data.nomor_hp || '',
          tanggal_dikukuhkan: data.data.tanggal_dikukuhkan || '',
        };
        
        setUser(userData);
        
        // Store user ID and user data in localStorage
        if (userData.id) {
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      if (err.message === 'Unauthorized' || err.message.includes('401')) {
        logout();
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkTokenAndRedirect, logout]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    user,
    isLoading,
    error,
    logout,
    refetch: fetchUserProfile,
  };
};
