'use client';

import Input from '../ui/Input';
import Toggle from './Toggle';

export default function SecuritySettings({ settings, onSettingChange }) {
  return (
    <div className="space-y-6">
      <Toggle
        label="Two-Factor Authentication"
        description="Add an extra layer of security to admin accounts"
        checked={settings.enableTwoFactor}
        onChange={(checked) => onSettingChange('enableTwoFactor', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => onSettingChange('sessionTimeout', parseInt(e.target.value))}
        />

        <Input
          label="Min Password Length"
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => onSettingChange('passwordMinLength', parseInt(e.target.value))}
        />
      </div>

      <Input
        label="Max Login Attempts"
        type="number"
        value={settings.loginAttempts}
        onChange={(e) => onSettingChange('loginAttempts', parseInt(e.target.value))}
        helperText="Number of failed login attempts before account lockout"
      />

      <Toggle
        label="Force Password Change"
        description="Require users to change password on next login"
        checked={settings.requirePasswordChange}
        onChange={(checked) => onSettingChange('requirePasswordChange', checked)}
      />
    </div>
  );
}
