'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  LogOut, 
  MessageCircle, 
  Users, 
  MessageSquare, 
  Home, 
  Calendar, 
  Settings, 
  Save,
  Shield,
  Database,
  Mail,
  Globe,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('System Settings')
  const [supportOpen, setSupportOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Database Anggota System',
    siteDescription: 'Sistem manajemen database anggota organisasi',
    timezone: 'Asia/Jakarta',
    language: 'id',
    dateFormat: 'DD/MM/YYYY',
    
    // Security Settings
    enableTwoFactor: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requirePasswordChange: false,
    loginAttempts: 5,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    emailFrom: 'noreply@example.com',
    emailFromName: 'Database Anggota System',
    
    // Member Settings
    allowSelfRegistration: true,
    requireEmailVerification: true,
    defaultMembershipStatus: 'pending',
    membershipExpiry: 365,
    
    // Notification Settings
    emailNotifications: true,
    newMemberNotification: true,
    eventReminders: true,
    systemAlerts: true,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 'local'
  })

  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, active: false, href: '/Dashboard' },
    { name: 'Member Management', icon: Users, active: false, href: '/members' }
  ]

  const settingsTabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'members', name: 'Members', icon: Users },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'backup', name: 'Backup', icon: Database }
  ]

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // Simulate saving settings
    alert('Settings saved successfully!')
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleSettingChange('siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600">Add an extra layer of security to admin accounts</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableTwoFactor}
            onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
        <input
          type="number"
          value={settings.loginAttempts}
          onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Number of failed login attempts before account lockout</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Force Password Change</h4>
          <p className="text-sm text-gray-600">Require users to change password on next login</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requirePasswordChange}
            onChange={(e) => handleSettingChange('requirePasswordChange', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
          <input
            type="number"
            value={settings.smtpPort}
            onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
        <input
          type="email"
          value={settings.smtpUsername}
          onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={settings.smtpPassword}
            onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
          <input
            type="email"
            value={settings.emailFrom}
            onChange={(e) => handleSettingChange('emailFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
          <input
            type="text"
            value={settings.emailFromName}
            onChange={(e) => handleSettingChange('emailFromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-800">Test Email Configuration</h4>
        </div>
        <p className="text-sm text-blue-600 mb-3">Send a test email to verify your SMTP settings</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          Send Test Email
        </button>
      </div>
    </div>
  )

  const renderMemberSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Allow Self Registration</h4>
          <p className="text-sm text-gray-600">Allow users to register themselves as members</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowSelfRegistration}
            onChange={(e) => handleSettingChange('allowSelfRegistration', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Email Verification Required</h4>
          <p className="text-sm text-gray-600">Require email verification for new members</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireEmailVerification}
            onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default Membership Status</label>
        <select
          value={settings.defaultMembershipStatus}
          onChange={(e) => handleSettingChange('defaultMembershipStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pending">Pending Approval</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Membership Expiry (days)</label>
        <input
          type="number"
          value={settings.membershipExpiry}
          onChange={(e) => handleSettingChange('membershipExpiry', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Set to 0 for no expiration</p>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Email Notifications</h4>
          <p className="text-sm text-gray-600">Enable email notifications system-wide</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">New Member Notifications</h4>
            <p className="text-sm text-gray-600">Notify admins when new members register</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.newMemberNotification}
              onChange={(e) => handleSettingChange('newMemberNotification', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Event Reminders</h4>
            <p className="text-sm text-gray-600">Send automatic event reminders to members</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.eventReminders}
              onChange={(e) => handleSettingChange('eventReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">System Alerts</h4>
            <p className="text-sm text-gray-600">Send system maintenance and security alerts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-800">Automatic Backup</h4>
          <p className="text-sm text-gray-600">Enable automatic database backups</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoBackup}
            onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
          <input
            type="number"
            value={settings.backupRetention}
            onChange={(e) => handleSettingChange('backupRetention', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
        <select
          value={settings.backupLocation}
          onChange={(e) => handleSettingChange('backupLocation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="local">Local Storage</option>
          <option value="cloud">Cloud Storage</option>
          <option value="ftp">FTP Server</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          <span>Create Backup</span>
        </button>

        <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Upload className="w-4 h-4" />
          <span>Restore Backup</span>
        </button>

        <button className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>View Backups</span>
        </button>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">Last Backup</h4>
        </div>
        <p className="text-sm text-yellow-700">August 21, 2025 at 02:00 AM (Success)</p>
        <p className="text-sm text-yellow-600 mt-1">Next scheduled backup: August 22, 2025 at 02:00 AM</p>
      </div>
    </div>
  )

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'general': return renderGeneralSettings()
      case 'security': return renderSecuritySettings()
      case 'email': return renderEmailSettings()
      case 'members': return renderMemberSettings()
      case 'notifications': return renderNotificationSettings()
      case 'backup': return renderBackupSettings()
      default: return renderGeneralSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-slate-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Syarif Rahman</h3>
              </div>
            </div>
          </div>
          
          <nav className="mt-6">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name)
                  setIsSidebarOpen(false)
                  if (item.href) router.push(item.href)
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors ${
                  activeTab === item.name ? 'bg-blue-600 border-r-2 border-blue-400' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="text-sm">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-green-500 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-800">
                System Settings
              </h1>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex">
            {/* Settings Sidebar */}
            <div className="w-64 bg-white border-r p-6">
              <nav className="space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSettingsTab === tab.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {settingsTabs.find(tab => tab.id === activeSettingsTab)?.name} Settings
                    </h2>
                    <button
                      onClick={handleSaveSettings}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>

                  {renderSettingsContent()}
                </div>

                {/* Danger Zone */}
                {activeSettingsTab === 'general' && (
                  <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-800">Reset All Settings</h4>
                          <p className="text-sm text-gray-600">Reset all system settings to default values</p>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Reset Settings
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-800">Clear All Data</h4>
                          <p className="text-sm text-gray-600">Permanently delete all member data and system logs</p>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2">
                          <Trash2 className="w-4 h-4" />
                          <span>Clear Data</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Information */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700">System Version</h4>
                      <p className="text-sm text-gray-600">v2.1.0</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700">Database Size</h4>
                      <p className="text-sm text-gray-600">42.3 MB</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700">Last Updated</h4>
                      <p className="text-sm text-gray-600">Aug 15, 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Button */}
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={() => setSupportOpen(!supportOpen)}
              className="bg-slate-700 hover:bg-slate-800 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            {supportOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Support
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}