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

      const data = await response.json();

      if (data.data) {
        setUser({
          id: data.data.id_member || data.data.id,
          nama: data.data.nama || 'Unknown User',
          nra: data.data.nra || 'N/A',
          email: data.data.email || 'N/A',
          foto: data.data.foto || null,
          status_keanggotaan: data.data.status_keanggotaan || 'anggota',
          jurusan: data.data.jurusan || 'N/A',
          angkatan: data.data.angkatan || 'N/A',
        });
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
