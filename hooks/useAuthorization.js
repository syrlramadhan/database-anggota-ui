'use client';

import { useAuth } from './useAuth';

export const useAuthorization = () => {
  const { user } = useAuth();

  // Check if user has admin privileges (DPO or BPH)
  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'dpo' || user.role === 'bph';
  };

  // Check if user can add new members
  const canAddMembers = () => {
    return isAdmin();
  };

  // Check if user can edit member status
  const canEditMemberStatus = () => {
    return isAdmin();
  };

  // Check if user can edit their own profile
  const canEditOwnProfile = () => {
    return !!user;
  };

  // Check if user can view member details
  const canViewMembers = () => {
    return !!user; // All authenticated users can view
  };

  // Check if user can edit full member profile (only admins)
  const canEditFullProfile = () => {
    return isAdmin();
  };

  // Get user role display name
  const getUserRole = () => {
    if (!user) return 'Guest';
    
    const roleMap = {
      'dpo': 'DPO',
      'bph': 'BPH', 
      'anggota': 'Anggota',
      'alb': 'ALB',
      'bp': 'BP'
    };
    
    return roleMap[user.role] || 'Unknown';
  };

  // Check if current user is the target user
  const isCurrentUser = (memberId) => {
    if (!user) return false;
    return user.id === memberId || user.id_member === memberId;
  };

  return {
    user,
    isAdmin: isAdmin(),
    canAddMembers: canAddMembers(),
    canEditMemberStatus: canEditMemberStatus(),
    canViewMembers: canViewMembers(),
    canEditFullProfile: canEditFullProfile(),
    getUserRole: getUserRole(),
    canEditOwnProfile,
    isCurrentUser
  };
};
