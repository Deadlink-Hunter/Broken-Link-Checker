export interface UrlCheckRecord {
  id: string;
  url: string;
  isBroken: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    ip?: string;
    origin?: string;
  };
}

export interface BulkCheckRecord {
  id: string;
  urls: string[];
  results: UrlCheckRecord[];
  summary: {
    total: number;
    broken: number;
    working: number;
  };
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    ip?: string;
    origin?: string;
  };
}

export interface StorageStats {
  totalChecks: number;
  totalUrls: number;
  brokenUrls: number;
  workingUrls: number;
  averageResponseTime: number;
  lastCheck: Date | null;
  checksToday: number;
  checksThisWeek: number;
  checksThisMonth: number;
}

export interface StorageInterface {
  saveSingleCheck(record: UrlCheckRecord): Promise<void>;
  saveBulkCheck(record: BulkCheckRecord): Promise<void>;
  getStats(): Promise<StorageStats>;
  getRecentChecks(limit?: number): Promise<UrlCheckRecord[]>;
  getChecksByDateRange(startDate: Date, endDate: Date): Promise<UrlCheckRecord[]>;
  cleanup(): Promise<void>;
}