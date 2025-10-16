/**
 * Standard API Response utilities for consistent backend responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Optional error details
 */
export const sendError = (res, message, statusCode = 400, error = null) => {
  const response = {
    success: false,
    message,
    ...(error && { error })
  };
  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 * @param {string} message - Error message
 */
export const sendValidationError = (res, errors, message = 'Validation failed') => {
  const response = {
    success: false,
    message,
    errors
  };
  return res.status(400).json(response);
};

/**
 * Send server error response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} message - Error message
 */
export const sendServerError = (res, error, message = 'Internal server error') => {
  console.error('Server Error:', error);
  const response = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
  return res.status(500).json(response);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendNotFound = (res, message = 'Resource not found') => {
  const response = {
    success: false,
    message
  };
  return res.status(404).json(response);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  const response = {
    success: false,
    message
  };
  return res.status(401).json(response);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendForbidden = (res, message = 'Access forbidden') => {
  const response = {
    success: false,
    message
  };
  return res.status(403).json(response);
};