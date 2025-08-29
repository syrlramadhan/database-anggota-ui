'use client';

import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';

export default function DangerZone() {
  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      alert('Settings reset functionality');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to permanently delete all member data? This action cannot be undone.')) {
      alert('Clear data functionality');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
      <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Reset All Settings</h4>
            <p className="text-sm text-gray-600">Reset all system settings to default values</p>
          </div>
          <Button onClick={handleResetSettings} variant="danger" size="sm">
            Reset Settings
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Clear All Data</h4>
            <p className="text-sm text-gray-600">Permanently delete all member data and system logs</p>
          </div>
          <Button 
            onClick={handleClearData} 
            variant="danger" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
