'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config';

export default function LoginPage() {
  const [nra, setNra] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Function to format NRA input automatically
  const formatNRA = (value) => {
    // Remove all non-digit characters
    let formattedValue = value.replace(/[^\d]/g, '');
    
    // Apply formatting XX.XX.XXX
    if (formattedValue.length >= 2) {
      formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
    }
    if (formattedValue.length >= 6) {
      formattedValue = formattedValue.substring(0, 5) + '.' + formattedValue.substring(5, 8);
    }
    
    return formattedValue;
  };

  const handleNRAChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatNRA(rawValue);
    setNra(formattedValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateInput = () => {
    if (!nra.trim() || !password.trim()) {
      setError('NRA dan kata sandi harus diisi.');
      return false;
    }
    // Validasi format NRA harus XX.XX.XXX
    if (!/^\d{2}\.\d{2}\.\d{3}$/.test(nra)) {
      setError('Format NRA harus XX.XX.XXX (contoh: 13.24.005)');
      return false;
    }
    if (password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateInput()) {
      setIsLoading(false);
      return;
    }

    console.log('Login Request Payload:', JSON.stringify({ nra, password }, null, 2));

    const retryFetch = async (url, options, retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
          console.log(`Attempt ${i + 1} to fetch ${url}`);
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          console.log(`Response status: ${response.status}`);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          console.error(`Fetch attempt ${i + 1} failed: ${err.message}`);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`Fetch failed after ${retries} attempts: ${err.message}`);
        }
      }
    };

    try {
      const response = await retryFetch(`${config.api.url}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nra, password }),
      });

      let data;
      try {
        data = await response.json();
        console.log('API Login Response:', JSON.stringify(data, null, 2));
      } catch (jsonError) {
        throw new Error('Respons server tidak valid. Silakan coba lagi nanti.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('NRA atau kata sandi salah. Silakan coba lagi.');
        }
        if (response.status === 500) {
          throw new Error('Kesalahan server internal. Silakan coba lagi nanti atau hubungi administrator.');
        }
        throw new Error(data.message || 'Login gagal. Periksa NRA atau kata sandi Anda.');
      }

      const token = data.data;
      if (token) {
        localStorage.setItem('token', token);
        console.log('Token saved:', token);
        
        // Fetch user profile to get user ID and store it
        try {
          const profileResponse = await fetch(`${config.api.url}/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.data && profileData.data.id_member) {
              localStorage.setItem('userId', profileData.data.id_member);
              console.log('User ID saved:', profileData.data.id_member);
            }
          }
        } catch (profileError) {
          console.warn('Failed to fetch user profile during login:', profileError);
        }
        
        router.push('/Dashboard');
      } else {
        throw new Error('Tidak ada token dalam respons server. Struktur respon: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Kesalahan login:', err.message);
      if (err.name === 'AbortError') {
        setError('Permintaan ke server terlalu lama. Silakan coba lagi.');
      } else if (err.message.includes('Failed to fetch')) {
        setError(`Gagal terhubung ke server setelah 3 percobaan. Periksa koneksi internet Anda atau <a href="mailto:support@example.com" class="text-blue-500 underline">hubungi dukungan</a>.`);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Selamat Datang
          </h1>
          <p className="text-gray-600 text-sm">
            Sistem Manajemen Anggota Coconut Computer Club
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-600 text-sm text-center p-4 bg-red-50 border border-red-200 rounded-lg" dangerouslySetInnerHTML={{ __html: error }} />
          )}
          
          <div>
            <label htmlFor="nra" className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor Registrasi Anggota (NRA)
            </label>
            <input
              id="nra"
              type="text"
              placeholder="13.24.005"
              value={nra}
              onChange={handleNRAChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
              disabled={isLoading}
              maxLength={9}
              pattern="\d{2}\.\d{2}\.\d{3}"
              title="Format harus XX.XX.XXX (contoh: 13.24.005)"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
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
            {isLoading ? 'Sedang Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white font-medium">Metode Alternatif</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>
        
        {/* Token Login */}
        <div className="space-y-4">
          <button
            type="button"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={() => router.push('/login-token')}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Login dengan Token
          </button>
          
          {/* Token Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">
                  Tentang Login Token
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Token login Adalah Token Sekali Pakai  <span className="font-semibold">Bagi Yang Sebalumnya Belum Mempunyai Akun</span> Hubungi pengurus untuk mendapatkan token akses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2025 Coconut Computer Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
