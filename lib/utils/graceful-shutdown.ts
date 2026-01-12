/**
 * Graceful Shutdown Utilities
 * Handles cleanup on application shutdown
 */

let isShuttingDown = false
const cleanupTasks: Array<() => Promise<void> | void> = []

/**
 * Register a cleanup task to run on shutdown
 */
export function registerCleanupTask(task: () => Promise<void> | void) {
  cleanupTasks.push(task)
}

/**
 * Execute all cleanup tasks
 */
async function executeCleanupTasks(): Promise<void> {
  if (isShuttingDown) {
    return // Already shutting down
  }

  isShuttingDown = true
  console.log('🛑 Initiating graceful shutdown...')

  // Execute all cleanup tasks in parallel with timeout
  const cleanupPromises = cleanupTasks.map(async (task, index) => {
    try {
      await Promise.race([
        Promise.resolve(task()),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cleanup task timeout')), 10000)
        )
      ])
    } catch (error) {
      console.error(`⚠️  Cleanup task ${index} failed:`, error)
    }
  })

  await Promise.allSettled(cleanupPromises)
  console.log('✅ Graceful shutdown complete')
}

/**
 * Setup graceful shutdown handlers
 */
export function setupGracefulShutdown(): void {
  // Handle SIGTERM (Docker, Kubernetes, etc.)
  process.on('SIGTERM', async () => {
    console.log('📨 SIGTERM received, starting graceful shutdown...')
    await executeCleanupTasks()
    process.exit(0)
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('📨 SIGINT received, starting graceful shutdown...')
    await executeCleanupTasks()
    process.exit(0)
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught exception:', error)
    await executeCleanupTasks()
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ Unhandled promise rejection:', reason, promise)
    // Don't exit on unhandled rejection in production (might be transient)
    // But log it for monitoring
  })

  console.log('✅ Graceful shutdown handlers registered')
}

// Auto-setup on module load (server-side only)
if (typeof window === 'undefined') {
  setupGracefulShutdown()
}
