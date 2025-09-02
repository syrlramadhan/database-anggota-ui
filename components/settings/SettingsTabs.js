'use client';

import { 
  Settings, 
  Shield, 
  Mail, 
  Users, 
  Bell, 
  Database,
  User
} from 'lucide-react';

export default function SettingsTabs({ activeTab, onTabChange }) {
  const settingsTabs = [
    { id: 'profile', name: 'Edit Profil Saya', icon: User },
    { id: 'backup', name: 'Backup', icon: Database }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
              activeTab === tab.id 
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
  );
}
