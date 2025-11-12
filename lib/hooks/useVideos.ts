'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi, type VideoStatus } from '@/lib/api/videos';

export const useVideos = (page = 1, limit = 20, status?: VideoStatus) => {
  return useQuery({
    queryKey: ['videos', page, limit, status],
    queryFn: () => videosApi.getAll({ page, limit, status }),
  });
};

export const useVideo = (id: string) => {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateVideoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VideoStatus }) =>
      videosApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    },
  });
};

export const useUpdateVideoPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) =>
      videosApi.updatePriority(id, priority),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

