import path from "path";
import { UrlCheckResult } from "@urlService";
import { appendToJsonArrayFile } from "@jsonFileService";

const DATA_DIRECTORY_NAME = "data";
const MONTH_OFFSET = 1;
const PAD_LENGTH = 2;
const PAD_CHARACTER = "0";
const ERROR_MESSAGE_SAVE_RESULTS = "Error saving URL check results to file:";
const DATA_DIR = path.join(process.cwd(), DATA_DIRECTORY_NAME);

export interface UrlCheckRecord {
  result: UrlCheckResult;
  lastCheckedAtIso: string;
}

const getTodayDateComponents = (): {
  year: number;
  month: string;
  day: string;
  dateString: string;
} => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + MONTH_OFFSET).padStart(
    PAD_LENGTH,
    PAD_CHARACTER,
  );
  const day = String(today.getDate()).padStart(PAD_LENGTH, PAD_CHARACTER);
  const dateString = `${year}-${month}-${day}`;
  return { year, month, day, dateString };
};

export const getYearMonthPath = (): string => {
  const { year, month } = getTodayDateComponents();
  return path.join(DATA_DIR, String(year), month);
};

const getTodayFilePath = (): string => {
  const { dateString } = getTodayDateComponents();
  const yearMonthPath = getYearMonthPath();
  return path.join(yearMonthPath, `${dateString}.json`);
};

export const appendResult = async (result: UrlCheckResult): Promise<void> => {
  return appendResults([result]);
};

export const appendResults = async (
  results: UrlCheckResult[],
): Promise<void> => {
  try {
    const filePath = getTodayFilePath();
    const lastCheckedAtIso = new Date().toISOString();

    const newRecords: UrlCheckRecord[] = results.map((result) => ({
      result,
      lastCheckedAtIso,
    }));

    await appendToJsonArrayFile<UrlCheckRecord>(filePath, newRecords);
  } catch (error) {
    console.error(ERROR_MESSAGE_SAVE_RESULTS, error);
  }
};
