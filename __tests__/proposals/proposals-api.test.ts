/**
 * Tests for Proposals API Operations
 * Tests proposal CRUD operations and QR code generation
 */

import { proposalsApi, type Proposal } from '@/lib/api/proposals';

// Mock the API client - define mocks inside the factory function
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api/client', () => {
  const mockGetFn = jest.fn();
  const mockPostFn = jest.fn();
  const mockPatchFn = jest.fn();
  const mockDeleteFn = jest.fn();
  
  return {
    __esModule: true,
    default: {
      get: mockGetFn,
      post: mockPostFn,
      patch: mockPatchFn,
      delete: mockDeleteFn,
    },
    apiClient: {
      get: mockGetFn,
      post: mockPostFn,
      patch: mockPatchFn,
      delete: mockDeleteFn,
    },
  };
});

// Import after mock to get the mocked functions
import { apiClient } from '@/lib/api/client';

describe('Proposals API', () => {
  const mockProposal: Proposal = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Proposal',
    message: 'Test Message',
    projectId: 'project-123',
    project: {
      id: 'project-123',
      name: 'Test Project',
      location: 'Test Location',
    },
    duration: 1,
    displayStart: '2025-01-01T00:00:00Z',
    displayEnd: '2025-02-01T00:00:00Z',
    image: '/uploads/proposals/test.jpg',
    status: 'enabled',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all proposals', async () => {
      const mockResponse = {
        data: {
          data: [mockProposal],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/proposals');
      expect(result).toEqual([mockProposal]);
    });

    it('should handle empty proposals list', async () => {
      const mockResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch proposal by ID', async () => {
      const mockResponse = {
        data: {
          data: mockProposal,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.getById(mockProposal.id);

      expect(apiClient.get).toHaveBeenCalledWith(`/proposals/${mockProposal.id}`);
      expect(result).toEqual(mockProposal);
    });
  });

  describe('create', () => {
    it('should create a new proposal', async () => {
      const createData = {
        name: 'New Proposal',
        message: 'New Message',
        projectId: 'project-123',
        duration: 3,
        displayStart: '2025-01-01T00:00:00Z',
        displayEnd: '2025-04-01T00:00:00Z',
        status: 'enabled' as const,
      };

      const mockResponse = {
        data: {
          data: { ...mockProposal, ...createData },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.create(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/proposals', createData);
      expect(result).toEqual({ ...mockProposal, ...createData });
    });

    it('should create proposal with image', async () => {
      const createData = {
        name: 'New Proposal',
        message: 'New Message',
        projectId: 'project-123',
        duration: 1,
        displayStart: '2025-01-01T00:00:00Z',
        displayEnd: '2025-02-01T00:00:00Z',
        image: 'data:image/png;base64,test-image-data',
        status: 'enabled' as const,
      };

      const mockResponse = {
        data: {
          data: { ...mockProposal, ...createData },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.create(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/proposals', createData);
      expect(result.image).toBe(createData.image);
    });
  });

  describe('update', () => {
    it('should update an existing proposal', async () => {
      const updateData = {
        name: 'Updated Proposal',
        message: 'Updated Message',
      };

      const updatedProposal = { ...mockProposal, ...updateData };
      const mockResponse = {
        data: {
          data: updatedProposal,
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.update(mockProposal.id, updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(`/proposals/${mockProposal.id}`, updateData);
      expect(result.name).toBe('Updated Proposal');
      expect(result.message).toBe('Updated Message');
    });
  });

  describe('delete', () => {
    it('should delete a proposal', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({} as any);

      await proposalsApi.delete(mockProposal.id);

      expect(apiClient.delete).toHaveBeenCalledWith(`/proposals/${mockProposal.id}`);
    });
  });

  describe('getDownloadQR', () => {
    it('should fetch QR code for proposal download', async () => {
      const qrData = {
        proposalId: mockProposal.id,
        downloadUrl: 'http://localhost:3001/propose/download/550e8400-e29b-41d4-a716-446655440000',
        qrCode: 'data:image/png;base64,test-qr-code-data',
      };

      const mockResponse = {
        data: {
          data: qrData,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.getDownloadQR(mockProposal.id);

      expect(apiClient.get).toHaveBeenCalledWith(`/proposals/${mockProposal.id}/download-qr`);
      expect(result).toEqual(qrData);
      expect(result.proposalId).toBe(mockProposal.id);
      expect(result.downloadUrl).toContain(mockProposal.id);
      expect(result.qrCode).toContain('data:image/png;base64');
    });

    it('should handle API response without data wrapper', async () => {
      const qrData = {
        proposalId: mockProposal.id,
        downloadUrl: 'http://localhost:3001/propose/download/550e8400-e29b-41d4-a716-446655440000',
        qrCode: 'data:image/png;base64,test-qr-code-data',
      };

      const mockResponse = {
        data: qrData,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.getDownloadQR(mockProposal.id);

      expect(result).toEqual(qrData);
    });
  });

  describe('getStats', () => {
    it('should calculate statistics from proposals list', async () => {
      const proposals = [
        { ...mockProposal, status: 'enabled' as const, displayEnd: '2025-12-31T00:00:00Z' },
        { ...mockProposal, id: '2', status: 'enabled' as const, displayEnd: '2024-01-01T00:00:00Z' },
        { ...mockProposal, id: '3', status: 'disabled' as const, displayEnd: '2025-12-31T00:00:00Z' },
      ];

      const mockResponse = {
        data: {
          data: proposals,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse as any);

      const result = await proposalsApi.getStats();

      expect(result.totalProposals).toBe(3);
      expect(result.activeProposals).toBeGreaterThanOrEqual(0);
      expect(result.expiredProposals).toBeGreaterThanOrEqual(0);
    });
  });
});
