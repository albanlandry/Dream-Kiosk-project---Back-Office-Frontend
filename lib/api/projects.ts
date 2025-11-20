import { apiClient } from './client';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped';
  startDate: string | Date;
  endDate?: string | Date;
  location: string;
  owner: string;
  totalContent: number;
  totalRevenue: number;
  kiosks?: Array<{ id: string; name: string }>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProjectResponse {
  data: Project | Project[] | {
    data: Project[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
  _links?: Record<string, { href: string; method: string }>;
}

export interface ProjectListResponse {
  data: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const projectsApi = {
  getAll: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    fields?: string;
  }): Promise<Project[]> => {
    const response = await apiClient.get<ProjectResponse>('/projects', { params });
    const data = response.data?.data || response.data;
    
    // Handle paginated response
    if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
      return (data as ProjectListResponse).data;
    }
    
    return Array.isArray(data) ? data : [];
  },

  getAllPaginated: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    fields?: string;
  }): Promise<ProjectListResponse> => {
    try {
      const response = await apiClient.get<ProjectResponse>('/projects', { params });
      
      // Handle HATEOAS wrapped response: { data: {...}, _links: {...} }
      const responseData = response.data?.data || response.data;
      
      // Handle paginated response
      if (
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData &&
        'pagination' in responseData
      ) {
        return responseData as ProjectListResponse;
      }
      
      // If not paginated, wrap it
      const projects = Array.isArray(responseData) ? responseData : [];
      return {
        data: projects,
        pagination: {
          total: projects.length,
          page: params?.page || 1,
          limit: params?.limit || projects.length,
          totalPages: 1,
          hasMore: false,
        },
      };
    } catch (error: any) {
      console.error('Error in getAllPaginated:', error);
      // Return empty result on error
      return {
        data: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ProjectResponse>(`/projects/${id}`);
    return response.data?.data || response.data;
  },

  create: async (project: {
    name: string;
    description?: string;
    location: string;
    owner: string;
    startDate: string;
    endDate?: string;
    status?: 'active' | 'paused' | 'stopped';
  }): Promise<Project> => {
    const response = await apiClient.post<ProjectResponse>('/projects', project);
    return response.data?.data || response.data;
  },

  update: async (
    id: string,
    project: {
      name?: string;
      description?: string;
      location?: string;
      owner?: string;
      startDate?: string;
      endDate?: string;
      status?: 'active' | 'paused' | 'stopped';
    },
  ): Promise<Project> => {
    const response = await apiClient.patch<ProjectResponse>(`/projects/${id}`, project);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

