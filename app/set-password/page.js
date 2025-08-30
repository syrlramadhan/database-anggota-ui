'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, X } from 'lucide-react';
import config from '../../config';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const router = useRouter();

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  // Cek apakah ada token JWT di localStorage saat halaman dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Jika tidak ada token, redirect ke halaman login
      router.push('/');
    }
  }, [router]);

  const validatePassword = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Password dan konfirmasi password harus diisi.');
      return false;
    }
    if (password.length < 8) {
      setError('Password harus minimal 8 karakter.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password harus mengandung huruf kecil, huruf besar, dan angka.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validatePassword()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`${config.api.url}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          password: password.trim(),
          confirm_password: confirmPassword.trim()
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Respons server tidak valid. Silakan coba lagi nanti.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Token tidak valid. Silakan login ulang.');
        }
        throw new Error(data.message || 'Gagal mengatur password. Silakan coba lagi.');
      }

      // Berhasil set password, arahkan ke halaman lengkapi profile
      showNotification('success', 'Password berhasil diatur! Mengarahkan ke halaman lengkapi profil...');
      
      // Delay redirect to show notification
      setTimeout(() => {
        router.push('/complete-profile');
      }, 1500);
    } catch (err) {
      if (err.message.includes('Token tidak valid')) {
        router.push('/');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: score * 20, label: 'Lemah', color: 'bg-red-500' };
    if (score <= 3) return { strength: score * 20, label: 'Sedang', color: 'bg-yellow-500' };
    if (score <= 4) return { strength: score * 20, label: 'Kuat', color: 'bg-green-500' };
    return { strength: 100, label: 'Sangat Kuat', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Atur Password Baru
          </h1>
          <p className="text-gray-600 text-sm">
            Silakan buat password yang aman untuk akun Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Kekuatan Password</span>
                  <span className={passwordStrength.strength >= 80 ? 'text-green-600' : passwordStrength.strength >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2 flex items-center text-xs">
                {password === confirmPassword ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Password cocok
                  </div>
                ) : (
                  <div className="text-red-600">
                    Password tidak cocok
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Syarat Password:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Minimal 8 karakter
              </li>
              <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Mengandung huruf kecil
              </li>
              <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Mengandung huruf besar
              </li>
              <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Mengandung angka
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className={`w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
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
                Menyimpan Password...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Simpan Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className={`
            rounded-lg shadow-lg border p-4 transition-all duration-300 transform
            ${notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className="rounded-md inline-flex text-green-400 hover:text-green-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
