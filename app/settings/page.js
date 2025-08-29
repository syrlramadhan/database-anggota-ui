'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import SettingsTabs from '../../components/settings/SettingsTabs';
import GeneralSettings from '../../components/settings/GeneralSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import EmailSettings from '../../components/settings/EmailSettings';
import MemberSettings from '../../components/settings/MemberSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import BackupSettings from '../../components/settings/BackupSettings';
import DangerZone from '../../components/settings/DangerZone';
import SystemInformation from '../../components/settings/SystemInformation';

export default function SettingsPage() {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
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
  });

  const settingsTabs = [
    { id: 'general', name: 'General' },
    { id: 'security', name: 'Security' },
    { id: 'email', name: 'Email' },
    { id: 'members', name: 'Members' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'backup', name: 'Backup' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    alert('Settings saved successfully!');
  };

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'general': 
        return <GeneralSettings settings={settings} onSettingChange={handleSettingChange} />;
      case 'security': 
        return <SecuritySettings settings={settings} onSettingChange={handleSettingChange} />;
      case 'email': 
        return <EmailSettings settings={settings} onSettingChange={handleSettingChange} />;
      case 'members': 
        return <MemberSettings settings={settings} onSettingChange={handleSettingChange} />;
      case 'notifications': 
        return <NotificationSettings settings={settings} onSettingChange={handleSettingChange} />;
      case 'backup': 
        return <BackupSettings settings={settings} onSettingChange={handleSettingChange} />;
      default: 
        return <GeneralSettings settings={settings} onSettingChange={handleSettingChange} />;
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-blue-100 mt-2">Configure and manage your application settings</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Settings Sidebar */}
        <SettingsTabs 
          activeTab={activeSettingsTab} 
          onTabChange={setActiveSettingsTab} 
        />

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {settingsTabs.find(tab => tab.id === activeSettingsTab)?.name} Settings
              </h2>
              <Button
                onClick={handleSaveSettings}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>

            {renderSettingsContent()}
          </div>

          {/* Danger Zone - Only show on general tab */}
          {activeSettingsTab === 'general' && (
            <div className="mt-6">
              <DangerZone />
            </div>
          )}

          {/* System Information */}
          <div className="mt-6">
            <SystemInformation />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}