'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/lib/api/images';

export const useImages = (page = 1, limit = 20, activeOnly?: boolean) => {
  return useQuery({
    queryKey: ['images', page, limit, activeOnly],
    queryFn: () => imagesApi.getAll({ page, limit, active_only: activeOnly }),
  });
};

export const useImage = (id: string) => {
  return useQuery({
    queryKey: ['image', id],
    queryFn: () => imagesApi.getById(id),
    enabled: !!id,
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: imagesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

export const useToggleImageActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: imagesApi.toggleActive,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['image', id] });
    },
  });
};

