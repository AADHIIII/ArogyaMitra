import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@arogyamitra/shared';

/**
 * Standard API response utility functions
 */
export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    error: string,
    statusCode: number = 400,
    details?: any
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      error,
      ...(details && { details }),
    });
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): Response<ApiResponse<PaginatedResponse<T>>> {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data: {
        data,
        total,
        page,
        limit,
        totalPages,
      },
      message,
    });
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return ResponseUtil.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 403);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: any,
    message: string = 'Validation failed'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 422, errors);
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 500);
  }
}