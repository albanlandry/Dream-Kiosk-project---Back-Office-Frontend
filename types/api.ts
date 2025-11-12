export interface PaginatedResponse<T> {
  data: {
    items: T[];
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  links?: {
    self?: { href: string };
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

