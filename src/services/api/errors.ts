export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  statusCode?: number;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  statusCode?: number;
};

export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
