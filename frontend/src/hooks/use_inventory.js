/*
 * MotoMart IMS
 * File: src/hooks/use_inventory.js
 * Version: 1.1.0
 * Purpose: Inventory hook (React Query) for clean logic.
 *
 * Changes:
 * - Added support for viewing archived items.
 * - Added archive / restore / permanent delete mutations.
 */
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '../lib/api_client';
import { useAuth } from '../state/auth_context';

const QK_INVENTORY = ['inventory'];
const QK_ANALYTICS = ['analytics', 'summary'];

export function useInventory({ search = '', category = '', status = 'active' } = {}) {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient({ token }), [token]);
  const qc = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: [...QK_INVENTORY, { search, category, status }],
    queryFn: async () => {
      const res = await api.get('/inventory', { params: { q: search, category, status } });
      return res.data.data;
    }
  });

  const analyticsQuery = useQuery({
    queryKey: QK_ANALYTICS,
    queryFn: async () => {
      const res = await api.get('/analytics/summary');
      return res.data.data;
    }
  });

  const createItem = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/inventory', payload);
      return res.data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK_INVENTORY });
      await qc.invalidateQueries({ queryKey: QK_ANALYTICS });
    }
  });

  const moveStock = useMutation({
    mutationFn: async ({ id, direction, quantity, note }) => {
      const res = await api.patch(`/inventory/${id}/stock`, { direction, quantity, note });
      return res.data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK_INVENTORY });
      await qc.invalidateQueries({ queryKey: QK_ANALYTICS });
    }
  });

  const archiveItem = useMutation({
    mutationFn: async ({ id, note }) => {
      const res = await api.patch(`/inventory/${id}/archive`, { note });
      return res.data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK_INVENTORY });
      await qc.invalidateQueries({ queryKey: QK_ANALYTICS });
    }
  });

  const restoreItem = useMutation({
    mutationFn: async ({ id, note }) => {
      const res = await api.patch(`/inventory/${id}/restore`, { note });
      return res.data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK_INVENTORY });
      await qc.invalidateQueries({ queryKey: QK_ANALYTICS });
    }
  });

  const deletePermanently = useMutation({
    mutationFn: async ({ id }) => {
      const res = await api.delete(`/inventory/${id}/permanent`);
      return res.data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK_INVENTORY });
      await qc.invalidateQueries({ queryKey: QK_ANALYTICS });
    }
  });

  const compatSearch = useMutation({
    mutationFn: async ({ make, model, year }) => {
      const res = await api.get('/compat/motorcycles', { params: { make, model, year } });
      return res.data.data;
    }
  });

  return {
    inventory: inventoryQuery.data || [],
    inventoryLoading: inventoryQuery.isLoading,
    inventoryError: inventoryQuery.error,

    analytics: analyticsQuery.data || null,
    analyticsLoading: analyticsQuery.isLoading,
    analyticsError: analyticsQuery.error,

    createItem,
    moveStock,
    archiveItem,
    restoreItem,
    deletePermanently,
    compatSearch
  };
}
