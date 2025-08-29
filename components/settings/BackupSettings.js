'use client';

import { Download, Upload, RefreshCw, Database } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Toggle from './Toggle';

export default function BackupSettings({ settings, onSettingChange }) {
  const handleCreateBackup = () => {
    alert('Creating backup...');
  };

  const handleRestoreBackup = () => {
    alert('Restore backup functionality');
  };

  const handleViewBackups = () => {
    alert('View backups functionality');
  };

  return (
    <div className="space-y-6">
      <Toggle
        label="Automatic Backup"
        description="Enable automatic database backups"
        checked={settings.autoBackup}
        onChange={(checked) => onSettingChange('autoBackup', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Backup Frequency"
          value={settings.backupFrequency}
          onChange={(e) => onSettingChange('backupFrequency', e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>

        <Input
          label="Retention Period (days)"
          type="number"
          value={settings.backupRetention}
          onChange={(e) => onSettingChange('backupRetention', parseInt(e.target.value))}
        />
      </div>

      <Select
        label="Backup Location"
        value={settings.backupLocation}
        onChange={(e) => onSettingChange('backupLocation', e.target.value)}
      >
        <option value="local">Local Storage</option>
        <option value="cloud">Cloud Storage</option>
        <option value="ftp">FTP Server</option>
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={handleCreateBackup} className="flex items-center justify-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Create Backup</span>
        </Button>

        <Button onClick={handleRestoreBackup} variant="success" className="flex items-center justify-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Restore Backup</span>
        </Button>

        <Button onClick={handleViewBackups} variant="warning" className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>View Backups</span>
        </Button>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">Last Backup</h4>
        </div>
        <p className="text-sm text-yellow-700">August 29, 2025 at 02:00 AM (Success)</p>
        <p className="text-sm text-yellow-600 mt-1">Next scheduled backup: August 30, 2025 at 02:00 AM</p>
      </div>
    </div>
  );
}
