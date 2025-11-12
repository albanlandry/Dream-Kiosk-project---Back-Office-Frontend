export interface Image {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  thumbnailPath?: string;
  description?: string;
  width: number;
  height: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  backgroundVideoId: string;
  userPicture: string;
  userName: string;
  userMessage: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  priority: number;
  displayPeriodStart?: string;
  displayPeriodEnd?: string;
  payment?: Payment;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  videoId: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paymentUrl?: string;
  expiresAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  images: {
    total: number;
    active: number;
    inactive: number;
  };
  videos: {
    total: number;
    processing: number;
    ready: number;
    failed: number;
  };
}

