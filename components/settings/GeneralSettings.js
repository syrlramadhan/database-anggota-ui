'use client';

import Input from '../ui/Input';
import Select from '../ui/Select';

export default function GeneralSettings({ settings, onSettingChange }) {
  return (
    <div className="space-y-6">
      <Input
        label="Site Name"
        value={settings.siteName}
        onChange={(e) => onSettingChange('siteName', e.target.value)}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => onSettingChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Timezone"
          value={settings.timezone}
          onChange={(e) => onSettingChange('timezone', e.target.value)}
        >
          <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
          <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
          <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
        </Select>

        <Select
          label="Language"
          value={settings.language}
          onChange={(e) => onSettingChange('language', e.target.value)}
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </Select>
      </div>

      <Select
        label="Date Format"
        value={settings.dateFormat}
        onChange={(e) => onSettingChange('dateFormat', e.target.value)}
      >
        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
      </Select>
    </div>
  );
}
