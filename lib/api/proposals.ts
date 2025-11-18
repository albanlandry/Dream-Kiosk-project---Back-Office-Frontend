import { apiClient } from './client';

export interface Proposal {
  id: string;
  name: string;
  message: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    location: string;
  };
  duration: number; // 1, 3, 6, 12
  displayStart: string;
  displayEnd: string;
  image?: string;
  status: 'enabled' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface ProposalStats {
  totalProposals: number;
  activeProposals: number;
  expiredProposals: number;
  totalRevenue: number;
  totalProposalsChange?: number;
  activeProposalsChange?: number;
  expiredProposalsChange?: number;
  totalRevenueChange?: number;
}

export const proposalsApi = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await apiClient.get('/proposals');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Proposal> => {
    const response = await apiClient.get(`/proposals/${id}`);
    return response.data?.data || response.data;
  },

  create: async (proposal: Partial<Proposal>): Promise<Proposal> => {
    const response = await apiClient.post('/proposals', proposal);
    return response.data?.data || response.data;
  },

  update: async (id: string, proposal: Partial<Proposal>): Promise<Proposal> => {
    const response = await apiClient.patch(`/proposals/${id}`, proposal);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/proposals/${id}`);
  },

  getStats: async (): Promise<ProposalStats> => {
    // For now, calculate stats from proposals list
    // In the future, this could be a dedicated endpoint
    const proposals = await proposalsApi.getAll();
    const now = new Date();
    
    const activeProposals = proposals.filter(
      (p) => p.status === 'enabled' && new Date(p.displayEnd) >= now
    );
    const expiredProposals = proposals.filter(
      (p) => new Date(p.displayEnd) < now
    );

    return {
      totalProposals: proposals.length,
      activeProposals: activeProposals.length,
      expiredProposals: expiredProposals.length,
      totalRevenue: 0, // TODO: Calculate from actual revenue data
      totalProposalsChange: 8, // TODO: Calculate from historical data
      activeProposalsChange: 12,
      expiredProposalsChange: 0,
      totalRevenueChange: 15,
    };
  },
};

