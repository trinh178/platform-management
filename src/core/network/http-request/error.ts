import { HttpResponse } from './http-response';
import { getMessage } from '@/shared/utils';

/**
 * Error
 * @SS Server Success Response Data Props
 * @SE Server Error Response Props
 */
export class HttpRequestError<SE> extends Error {
  isHttpRequestError = true;
  response: HttpResponse<unknown, SE>;
  constructor(response: HttpResponse<unknown, SE>, message?: string) {
    super(message || getMessage(response.error, response.httpStatusMessage));
    this.name = this.constructor.name;
    this.response = response;
  }
}
