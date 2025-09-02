'use client';

import Toggle from './Toggle';

export default function NotificationSettings({ settings, onSettingChange }) {
  return (
    <div className="space-y-6">
      <Toggle
        label="Email Notifications"
        description="Enable email notifications system-wide"
        checked={settings.emailNotifications}
        onChange={(checked) => onSettingChange('emailNotifications', checked)}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">New Member Notifications</h4>
            <p className="text-sm text-gray-600">Notify admins when new members register</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.newMemberNotification}
              onChange={(e) => onSettingChange('newMemberNotification', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Event Reminders</h4>
            <p className="text-sm text-gray-600">Send automatic event reminders to members</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.eventReminders}
              onChange={(e) => onSettingChange('eventReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">System Alerts</h4>
            <p className="text-sm text-gray-600">Send system maintenance and security alerts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={(e) => onSettingChange('systemAlerts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}