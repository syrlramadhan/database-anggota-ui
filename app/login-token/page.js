'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Key, LogIn } from 'lucide-react';
import config from '../../config';

export default function TokenLoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateToken = () => {
    if (!token.trim()) {
      setError('Token harus diisi.');
      return false;
    }
    if (token.length < 10) {
      setError('Token terlalu pendek. Pastikan token yang Anda masukkan benar.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateToken()) {
      setIsLoading(false);
      return;
    }

    const retryFetch = async (url, options, retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`Fetch failed after ${retries} attempts: ${err.message}`);
        }
      }
    };

    console.log('Token Login Request:', JSON.stringify({ token: token.trim() }, null, 2));

    try {
      const response = await retryFetch(`${config.api.url}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      let data;
      try {
        data = await response.json();
        console.log('API Token Response:', JSON.stringify(data, null, 2));
      } catch (jsonError) {
        throw new Error('Respons server tidak valid. Silakan coba lagi nanti.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token tidak valid atau sudah kadaluarsa. Silakan periksa kembali token Anda.');
        }
        if (response.status === 404) {
          throw new Error('Endpoint tidak ditemukan. Silakan hubungi administrator.');
        }
        if (response.status === 500) {
          throw new Error('Kesalahan server internal. Silakan coba lagi nanti atau hubungi administrator.');
        }
        throw new Error(data.message || 'Login dengan token gagal. Periksa token Anda.');
      }

      // Menyimpan JWT token yang dikembalikan dari API
      if (data.code === 200 && data.data) {
        const jwtToken = data.data;
        localStorage.setItem('token', jwtToken);
        console.log('JWT Token saved:', jwtToken);
        // Arahkan ke halaman set password setelah login dengan token
        router.push('/set-password');
      } else {
        throw new Error('Login berhasil tetapi tidak ada JWT token dalam respons. Struktur respons: ' + JSON.stringify(data));
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Permintaan ke server terlalu lama. Silakan coba lagi.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToLogin}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Login dengan Token
            </h1>
            <p className="text-gray-600 text-sm">
              Masukkan token akses Anda untuk login
            </p>
          </div>
        </div>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Key className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-500 text-sm">
            Gunakan token yang telah diberikan untuk mengakses sistem
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Token Akses
            </label>
            <textarea
              id="token"
              placeholder="Masukkan token akses Anda di sini..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              rows={4}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Token biasanya berupa string panjang yang diberikan oleh administrator
            </p>
          </div>

          <button
            type="submit"
            className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
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
                Memverifikasi Token...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Masuk dengan Token
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-2">
            Tidak punya token?
          </p>
          <button
            type="button"
            className="text-purple-500 hover:text-purple-600 font-medium text-sm"
            onClick={handleBackToLogin}
            disabled={isLoading}
          >
            Kembali ke Login Normal
          </button>
        </div>
      </div>
    </div>
  );
}
