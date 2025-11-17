import apiClient from './client';

export interface Animal {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  characteristics?: string;
  themes?: string[];
  thumbnailUrl?: string;
  loveFileUrl?: string;
  healthFileUrl?: string;
  wealthFileUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const animalsApi = {
  getAll: async (): Promise<Animal[]> => {
    const response = await apiClient.get<{ data: Animal[] }>('/animals');
    return response.data?.data || response.data || [];
  },

  getById: async (id: string): Promise<Animal> => {
    const response = await apiClient.get<{ data: Animal }>(`/animals/${id}`);
    return response.data.data;
  },

  create: async (animal: {
    name: string;
    nameEn?: string;
    description?: string;
    characteristics?: string;
    themes?: string[];
    thumbnailUrl?: string;
    isActive?: boolean;
  }): Promise<Animal> => {
    const response = await apiClient.post<{ data: Animal }>('/animals', animal);
    return response.data.data;
  },

  update: async (id: string, animal: {
    name?: string;
    nameEn?: string;
    description?: string;
    characteristics?: string;
    themes?: string[];
    thumbnailUrl?: string;
    isActive?: boolean;
  }): Promise<Animal> => {
    const response = await apiClient.patch<{ data: Animal }>(`/animals/${id}`, animal);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/animals/${id}`);
  },
};

