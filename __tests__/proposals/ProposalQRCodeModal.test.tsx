/**
 * Tests for ProposalQRCodeModal Component
 * Tests QR code display, loading states, and download functionality
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposalQRCodeModal } from '@/components/proposals/ProposalQRCodeModal';
import { proposalsApi } from '@/lib/api/proposals';
import { useToastStore } from '@/lib/store/toastStore';
import type { Proposal } from '@/lib/api/proposals';

// Mock dependencies
jest.mock('@/lib/api/proposals');
jest.mock('@/lib/store/toastStore');

const mockedProposalsApi = proposalsApi as jest.Mocked<typeof proposalsApi>;
const mockToastStore = useToastStore as jest.MockedFunction<typeof useToastStore>;

describe('ProposalQRCodeModal', () => {
  const mockProposal: Proposal = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Proposal',
    message: 'Test Message',
    projectId: 'project-123',
    duration: 1,
    displayStart: '2025-01-01T00:00:00Z',
    displayEnd: '2025-02-01T00:00:00Z',
    status: 'enabled',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockOnClose = jest.fn();
  const mockShowError = jest.fn();

  const mockQRData = {
    proposalId: mockProposal.id,
    downloadUrl: 'http://localhost:3001/propose/download/550e8400-e29b-41d4-a716-446655440000',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToastStore.mockReturnValue({
      showError: mockShowError,
    } as any);

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render modal when open is true', () => {
    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('다운로드 QR 코드')).toBeInTheDocument();
  });

  it('should not render modal when open is false', () => {
    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('다운로드 QR 코드')).not.toBeInTheDocument();
  });

  it('should load QR code when modal opens', async () => {
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    expect(mockedProposalsApi.getDownloadQR).toHaveBeenCalledWith(mockProposal.id);

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching QR code', async () => {
    mockedProposalsApi.getDownloadQR.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockQRData), 100))
    );

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/QR 코드를 생성하는 중/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });
  });

  it('should display QR code image when loaded', async () => {
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const qrImage = screen.getByAltText('QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', mockQRData.qrCode);
    });
  });

  it('should display download URL', async () => {
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const urlInput = screen.getByDisplayValue(mockQRData.downloadUrl);
      expect(urlInput).toBeInTheDocument();
    });
  });

  it('should copy URL to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockQRData.downloadUrl)).toBeInTheDocument();
    });

    const copyButton = screen.getByTitle('URL 복사');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockQRData.downloadUrl);
  });

  it('should download QR code when download button is clicked', async () => {
    const user = userEvent.setup();
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    // Mock createElement and appendChild for link creation
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /QR 코드 다운로드/ });
    await user.click(downloadButton);

    expect(mockLink.href).toBe(mockQRData.qrCode);
    expect(mockLink.download).toContain(mockProposal.id);
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should handle API error when loading QR code', async () => {
    const errorMessage = 'Failed to load QR code';
    mockedProposalsApi.getDownloadQR.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
    });

    expect(screen.getByText(/QR 코드를 불러올 수 없습니다/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /닫기/ });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should reset QR code when modal closes', async () => {
    mockedProposalsApi.getDownloadQR.mockResolvedValue(mockQRData);

    const { rerender } = render(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });

    // Close modal
    rerender(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={false}
        onClose={mockOnClose}
      />
    );

    // Reopen modal - should fetch QR code again
    rerender(
      <ProposalQRCodeModal
        proposal={mockProposal}
        open={true}
        onClose={mockOnClose}
      />
    );

    expect(mockedProposalsApi.getDownloadQR).toHaveBeenCalledTimes(2);
  });

  it('should not load QR code when proposal is null', () => {
    render(
      <ProposalQRCodeModal
        proposal={null}
        open={true}
        onClose={mockOnClose}
      />
    );

    expect(mockedProposalsApi.getDownloadQR).not.toHaveBeenCalled();
  });
});

