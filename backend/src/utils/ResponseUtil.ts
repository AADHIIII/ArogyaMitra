/**
 * Response Utility - Standardized API responses
 * Consistent response format across the entire application
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@arogyamitra/shared';

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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return ResponseUtil.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send not found response (404)
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 404);
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 401);
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 403);
  }

  /**
   * Send validation error response (422)
   */
  static validationError(
    res: Response,
    errors: any,
    message: string = 'Validation failed'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 422, { validationErrors: errors });
  }

  /**
   * Send internal server error response (500)
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 500);
  }

  /**
   * Send conflict response (409)
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 409);
  }

  /**
   * Send too many requests response (429)
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests'
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, 429);
  }
}