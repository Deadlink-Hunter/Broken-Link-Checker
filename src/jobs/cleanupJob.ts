import { storageService } from '../services/storageService';

export class CleanupJob {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the cleanup job to run periodically
   * @param intervalHours - How often to run cleanup (in hours)
   */
  start(intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    console.log(`Starting cleanup job to run every ${intervalHours} hours`);
    
    // Run cleanup immediately
    this.runCleanup();
    
    // Schedule recurring cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, intervalMs);
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cleanup job stopped');
    }
  }

  /**
   * Run cleanup manually
   */
  async runCleanup(): Promise<void> {
    try {
      console.log('Running storage cleanup...');
      await storageService.cleanup();
      console.log('Storage cleanup completed successfully');
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const cleanupJob = new CleanupJob();