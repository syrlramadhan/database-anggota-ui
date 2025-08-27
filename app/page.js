'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [nra, setNra] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateInput = () => {
    if (!nra.trim() || !password.trim()) {
      setError('NRA dan kata sandi harus diisi.');
      return false;
    }
    if (nra.length > 50) {
      setError('NRA terlalu panjang (maksimum 50 karakter).');
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
      const response = await retryFetch('https://dbanggota.syahrulramadhan.site/api/member/login', {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang
          </h1>
          <p className="text-gray-600 text-sm">
            Akses data anggota secara aman dan cepat.
          </p>
        </div>
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-1">
            It is our great pleasure to have
          </p>
          <p className="text-gray-500 text-sm">
            you on board!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg" dangerouslySetInnerHTML={{ __html: error }} />
          )}
          <div>
            <label htmlFor="nra" className="block text-sm font-medium text-gray-700 mb-1">
              NRA
            </label>
            <input
              id="nra"
              type="text"
              placeholder="Masukkan NRA"
              value={nra}
              onChange={(e) => setNra(e.target.value.trim())}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Belum punya akun?{' '}
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600 font-medium"
              onClick={() => router.push('/register')}
              disabled={isLoading}
            >
              Daftar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
