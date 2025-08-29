'use client';

import Input from '../ui/Input';
import Select from '../ui/Select';
import Toggle from './Toggle';

export default function MemberSettings({ settings, onSettingChange }) {
  return (
    <div className="space-y-6">
      <Toggle
        label="Allow Self Registration"
        description="Allow users to register themselves as members"
        checked={settings.allowSelfRegistration}
        onChange={(checked) => onSettingChange('allowSelfRegistration', checked)}
      />

      <Toggle
        label="Email Verification Required"
        description="Require email verification for new members"
        checked={settings.requireEmailVerification}
        onChange={(checked) => onSettingChange('requireEmailVerification', checked)}
      />

      <Select
        label="Default Membership Status"
        value={settings.defaultMembershipStatus}
        onChange={(e) => onSettingChange('defaultMembershipStatus', e.target.value)}
      >
        <option value="pending">Pending Approval</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>

      <Input
        label="Membership Expiry (days)"
        type="number"
        value={settings.membershipExpiry}
        onChange={(e) => onSettingChange('membershipExpiry', parseInt(e.target.value))}
        helperText="Set to 0 for no expiration"
      />
    </div>
  );
}
