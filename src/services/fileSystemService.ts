import { mkdir } from "node:fs/promises";
import { getYearMonthPath } from "@urlRecordsService";

export interface FileSystemError extends Error {
  code?: string;
}

export const ensureDataDirectoryExists = async (): Promise<void> => {
  const yearMonthPath = getYearMonthPath();
  await mkdir(yearMonthPath, { recursive: true });
};
