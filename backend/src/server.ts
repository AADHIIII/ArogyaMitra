/**
 * Server Entry Point - Production-ready server initialization
 * Clean separation of concerns with proper error handling
 */

import { Application } from './core/Application';
import { logger } from './utils/Logger';

/**
 * Start the ArogyaMitra API server
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Starting ArogyaMitra API Server...');

    // Create application instance
    const app = new Application();

    // Initialize application
    await app.initialize();

    // Start server
    await app.start();

    logger.info('✅ ArogyaMitra API Server started successfully');

  } catch (error) {
    logger.error('❌ Failed to start ArogyaMitra API Server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();