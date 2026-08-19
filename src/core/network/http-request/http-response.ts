/**
 * Client Error Response Props
 */
export interface ClientErrorProps {
  code?: number | string | null;
  message: string;
}

/**
 * @SS Server Success Response Data Props
 * @SE Server Error Response Props
 */
export interface HttpResponse<SS, SE> {
  status: 'success' | 'client_error' | 'server_error';
  httpStatusCode?: number;
  httpStatusMessage?: string;
  error?: ClientErrorProps | SE;
  data?: SS;
}
