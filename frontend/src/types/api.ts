export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
