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
    
    // Jika kurang dari 2 karakter, kembalikan apa adanya
    if (formattedValue.length <= 2) {
      return formattedValue;
    }
    
    // Apply formatting XX.XX.XXX
    if (formattedValue.length >= 3 && formattedValue.length <= 4) {
      formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
    } else if (formattedValue.length >= 5) {
      formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2, 4) + '.' + formattedValue.substring(4, 7);
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
          throw new Error('NRA atau kata sandi salah. Silakan periksa kembali.');
        }
        if (response.status === 404) {
          throw new Error('NRA tidak ditemukan. Pastikan NRA sudah terdaftar.');
        }
        if (response.status === 500) {
          throw new Error('Server sedang bermasalah. Silakan coba lagi nanti.');
        }
        throw new Error(data.message || 'Login gagal. Periksa NRA dan kata sandi Anda.');
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
        setError(`Gagal terhubung ke server. Periksa koneksi internet Anda.`);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-blue-100">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Masuk
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-600 text-sm text-center p-4 bg-red-50 border border-red-200 rounded-2xl" dangerouslySetInnerHTML={{ __html: error }} />
          )}
          
          <div>
            <label htmlFor="nra" className="block text-sm font-semibold text-gray-700 mb-3">
              NRA
            </label>
            <input
              id="nra"
              type="text"
              placeholder="13.24.005"
              value={nra}
              onChange={handleNRAChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center font-mono tracking-wider text-lg"
              required
              disabled={isLoading}
              maxLength={9}
              pattern="\d{2}\.\d{2}\.\d{3}"
              title="Format harus XX.XX.XXX (contoh: 13.24.005)"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-1'
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
            {isLoading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400 bg-white font-medium">atau</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>
        
        {/* Token Login */}
        <div className="space-y-4">
          <button
            type="button"
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-4 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center border-2 border-gray-200 hover:border-gray-300"
            onClick={() => router.push('/login-token')}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Login dengan Token
          </button>
          
          {/* Token Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Token Sekali Pakai
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Untuk pendaftar baru yang belum memiliki akun. Hubungi pengurus untuk mendapatkan token.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            © 2025 Coconut Computer Club
          </p>
        </div>
      </div>
    </div>
  );
}
