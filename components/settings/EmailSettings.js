'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function EmailSettings({ settings, onSettingChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTestEmail = () => {
    // Simulate test email
    alert('Test email sent successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="SMTP Host"
          value={settings.smtpHost}
          onChange={(e) => onSettingChange('smtpHost', e.target.value)}
        />

        <Input
          label="SMTP Port"
          type="number"
          value={settings.smtpPort}
          onChange={(e) => onSettingChange('smtpPort', parseInt(e.target.value))}
        />
      </div>

      <Input
        label="SMTP Username"
        type="email"
        value={settings.smtpUsername}
        onChange={(e) => onSettingChange('smtpUsername', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={settings.smtpPassword}
            onChange={(e) => onSettingChange('smtpPassword', e.target.value)}
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
        <Input
          label="From Email"
          type="email"
          value={settings.emailFrom}
          onChange={(e) => onSettingChange('emailFrom', e.target.value)}
        />

        <Input
          label="From Name"
          value={settings.emailFromName}
          onChange={(e) => onSettingChange('emailFromName', e.target.value)}
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-800">Test Email Configuration</h4>
        </div>
        <p className="text-sm text-blue-600 mb-3">Send a test email to verify your SMTP settings</p>
        <Button onClick={handleTestEmail} size="sm">
          Send Test Email
        </Button>
      </div>
    </div>
  );
}
