/*
 * Carbon & Crimson IMS
 * File: src/hooks/use_system.js
 * Version: 1.0.0
 * Purpose: System management hook (Users & Activity Logs).
 */

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '../lib/api_client';
import { useAuth } from '../state/auth_context';

const QK_USERS = ['system', 'users'];
const QK_LOGS = ['system', 'logs'];
const QK_INV_LOGS = ['system', 'inventory-logs'];

export function useSystem(options = {}) {
  const { logUserId, invFilters = {} } = options;
  const { token, user: currentUser } = useAuth();
  const api = useMemo(() => createApiClient({ token }), [token]);
  const qc = useQueryClient();

  // Roles that can access these features
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const canViewInvLogs = canManage || currentUser?.role === 'staff';

  // Fetch Users
  const usersQuery = useQuery({
    queryKey: QK_USERS,
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
    enabled: !!token && canViewInvLogs
  });

  // Fetch Activity Logs
  const logsQuery = useQuery({
    queryKey: [...QK_LOGS, logUserId],
    queryFn: async () => {
      const url = logUserId ? `/system/logs?user_id=${logUserId}` : '/system/logs';
      const res = await api.get(url);
      return res.data.data;
    },
    enabled: !!token && canManage
  });

  // Fetch Inventory Logs
  const inventoryLogsQuery = useQuery({
    queryKey: [...QK_INV_LOGS, invFilters],
    queryFn: async () => {
      const res = await api.get('/system/inventory-logs', { params: invFilters });
      return res.data.data;
    },
    enabled: !!token && canViewInvLogs
  });

  // Create User
  const createUser = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/users', payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_USERS });
    }
  });

  // Toggle User Active Status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ id, is_active }) => {
      const res = await api.patch(`/users/${id}/status`, { is_active });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_USERS });
    }
  });

  // Delete User Permanently
  const deleteUser = useMutation({
    mutationFn: async ({ id }) => {
      const res = await api.delete(`/users/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_USERS });
    }
  });

  // Update Current User Profile
  const updateProfile = useMutation({
    mutationFn: async (payload) => {
      const res = await api.patch('/users/profile', payload);
      return res.data;
    }
  });

  return {
    users: usersQuery.data || [],
    usersLoading: usersQuery.isLoading,
    
    logs: logsQuery.data || [],
    logsLoading: logsQuery.isLoading,

    inventoryLogs: inventoryLogsQuery.data || [],
    inventoryLogsLoading: inventoryLogsQuery.isLoading,

    createUser,
    toggleUserStatus,
    deleteUser,
    updateProfile,

    canManage,
    canViewInvLogs
  };
}
