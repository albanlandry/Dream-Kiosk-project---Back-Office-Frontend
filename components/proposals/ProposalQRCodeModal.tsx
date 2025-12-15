'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Proposal, proposalsApi } from '@/lib/api/proposals';
import { useToastStore } from '@/lib/store/toastStore';

interface ProposalQRCodeModalProps {
  proposal: Proposal | null;
  open: boolean;
  onClose: () => void;
}

export function ProposalQRCodeModal({ proposal, open, onClose }: ProposalQRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useToastStore();

  useEffect(() => {
    if (open && proposal) {
      loadQRCode();
    } else {
      setQrCode(null);
      setDownloadUrl(null);
    }
  }, [open, proposal]);

  const loadQRCode = async () => {
    if (!proposal) return;

    try {
      setIsLoading(true);
      const data = await proposalsApi.getDownloadQR(proposal.id);
      setQrCode(data.qrCode);
      setDownloadUrl(data.downloadUrl);
    } catch (error: any) {
      console.error('Failed to load QR code:', error);
      showError(error.response?.data?.message || 'QR 코드를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `proposal-${proposal?.id}-qr-code.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    if (!downloadUrl) return;

    navigator.clipboard.writeText(downloadUrl).then(() => {
      // You could show a success toast here
    }).catch(() => {
      showError('URL 복사에 실패했습니다.');
    });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>다운로드 QR 코드</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">QR 코드를 생성하는 중...</p>
              </div>
            ) : qrCode ? (
              <>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-xs p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-full h-auto"
                    />
                  </div>
                  
                  {downloadUrl && (
                    <div className="w-full space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        다운로드 URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={downloadUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                        <Button
                          onClick={handleCopyUrl}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                          title="URL 복사"
                        >
                          <i className="fas fa-copy"></i>
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 text-center">
                    이 QR 코드를 스캔하면 프로포즈 사진을 다운로드할 수 있습니다.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleDownloadQR}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <i className="fas fa-download mr-2"></i>QR 코드 다운로드
                  </Button>
                  <Button
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    닫기
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">QR 코드를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

