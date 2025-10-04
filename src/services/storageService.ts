import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  UrlCheckRecord,
  BulkCheckRecord,
  StorageStats,
  StorageInterface,
} from '../types/storage';

export class JsonStorageService implements StorageInterface {
  private readonly dataDir: string;
  private readonly singleChecksFile: string;
  private readonly bulkChecksFile: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
    this.singleChecksFile = path.join(dataDir, 'single-checks.json');
    this.bulkChecksFile = path.join(dataDir, 'bulk-checks.json');
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      await this.ensureFileExists(this.singleChecksFile, []);
      await this.ensureFileExists(this.bulkChecksFile, []);
    } catch (error) {
      console.error('Failed to initialize JSON storage:', error);
    }
  }

  private async ensureFileExists(filePath: string, defaultData: any): Promise<void> {
    try {
      await fs.access(filePath);
    } catch (error) {
      // File doesn't exist, create it
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to read ${filePath}:`, error);
      return [];
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to write ${filePath}:`, error);
      throw error;
    }
  }

  async saveSingleCheck(record: UrlCheckRecord): Promise<void> {
    const records = await this.readJsonFile<UrlCheckRecord>(this.singleChecksFile);
    
    // Add the new record
    records.push({
      ...record,
      id: record.id || uuidv4(),
      timestamp: new Date(record.timestamp),
    });

    // Keep only the last 10000 records to prevent file from growing too large
    if (records.length > 10000) {
      records.splice(0, records.length - 10000);
    }

    await this.writeJsonFile(this.singleChecksFile, records);
  }

  async saveBulkCheck(record: BulkCheckRecord): Promise<void> {
    const records = await this.readJsonFile<BulkCheckRecord>(this.bulkChecksFile);
    
    // Add the new record
    records.push({
      ...record,
      id: record.id || uuidv4(),
      timestamp: new Date(record.timestamp),
    });

    // Keep only the last 1000 bulk records
    if (records.length > 1000) {
      records.splice(0, records.length - 1000);
    }

    await this.writeJsonFile(this.bulkChecksFile, records);

    // Also save individual URL checks for statistics
    for (const urlResult of record.results) {
      await this.saveSingleCheck(urlResult);
    }
  }

  async getStats(): Promise<StorageStats> {
    const singleChecks = await this.readJsonFile<UrlCheckRecord>(this.singleChecksFile);
    const bulkChecks = await this.readJsonFile<BulkCheckRecord>(this.bulkChecksFile);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUrls = singleChecks.length;
    const brokenUrls = singleChecks.filter(check => check.isBroken).length;
    const workingUrls = totalUrls - brokenUrls;

    const checksToday = singleChecks.filter(check => 
      new Date(check.timestamp) >= today
    ).length;

    const checksThisWeek = singleChecks.filter(check => 
      new Date(check.timestamp) >= thisWeek
    ).length;

    const checksThisMonth = singleChecks.filter(check => 
      new Date(check.timestamp) >= thisMonth
    ).length;

    const responseTimes = singleChecks
      .filter(check => check.responseTime !== undefined)
      .map(check => check.responseTime!);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const lastCheck = singleChecks.length > 0
      ? new Date(Math.max(...singleChecks.map(check => new Date(check.timestamp).getTime())))
      : null;

    return {
      totalChecks: bulkChecks.length + singleChecks.length,
      totalUrls,
      brokenUrls,
      workingUrls,
      averageResponseTime: Math.round(averageResponseTime),
      lastCheck,
      checksToday,
      checksThisWeek,
      checksThisMonth,
    };
  }

  async getRecentChecks(limit: number = 50): Promise<UrlCheckRecord[]> {
    const records = await this.readJsonFile<UrlCheckRecord>(this.singleChecksFile);
    
    return records
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getChecksByDateRange(startDate: Date, endDate: Date): Promise<UrlCheckRecord[]> {
    const records = await this.readJsonFile<UrlCheckRecord>(this.singleChecksFile);
    
    return records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  async cleanup(): Promise<void> {
    // Clean up old records (older than 30 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const singleChecks = await this.readJsonFile<UrlCheckRecord>(this.singleChecksFile);
    const bulkChecks = await this.readJsonFile<BulkCheckRecord>(this.bulkChecksFile);

    const filteredSingleChecks = singleChecks.filter(
      record => new Date(record.timestamp) > cutoffDate
    );

    const filteredBulkChecks = bulkChecks.filter(
      record => new Date(record.timestamp) > cutoffDate
    );

    await this.writeJsonFile(this.singleChecksFile, filteredSingleChecks);
    await this.writeJsonFile(this.bulkChecksFile, filteredBulkChecks);

    console.log(`Cleaned up old records. Kept ${filteredSingleChecks.length} single checks and ${filteredBulkChecks.length} bulk checks.`);
  }
}

// Singleton instance
export const storageService = new JsonStorageService();