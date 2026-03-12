import { open, stat } from 'node:fs/promises';
import { ensureDataDirectoryExists, FileSystemError } from '@fileSystemService';

const JSON_FILE_FOOTER_LENGTH = 2;
const JSON_INDENT_SPACES = 2;
const SLICE_START_INDEX = 1;
const SLICE_END_INDEX = -1;
const ERROR_CODE_FILE_NOT_FOUND = 'ENOENT';
const ERROR_MESSAGE_CREATE_FILE = 'Failed to create new file at';
const ERROR_MESSAGE_UNEXPECTED_ERROR = 'Unexpected error accessing file at';

const hasErrorCode = (error: unknown): error is FileSystemError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as FileSystemError).code === 'string'
  );
};

const appendToExistingFile = async (
  filePath: string,
  fileStats: { size: number },
  arrayContentWithoutBrackets: string,
): Promise<void> => {
  const fileHandle = await open(filePath, 'r+');
  const position = fileStats.size - JSON_FILE_FOOTER_LENGTH;
  const dataToAppend = `,\n  ${arrayContentWithoutBrackets}\n]`;
  try {
    await fileHandle.write(dataToAppend, position);
  } finally {
    await fileHandle.close();
  }
};

const writeNewFile = async (
  filePath: string,
  formattedJsonArray: string,
): Promise<void> => {
  await ensureDataDirectoryExists();
  const fileHandle = await open(filePath, 'w');
  try {
    await fileHandle.write(formattedJsonArray);
  } finally {
    await fileHandle.close();
  }
};

export const appendToJsonArrayFile = async <T>(
  filePath: string,
  newItems: T[],
): Promise<void> => {
  const formattedJsonArray = JSON.stringify(newItems, null, JSON_INDENT_SPACES);
  const arrayContentWithoutBrackets = formattedJsonArray
    .slice(SLICE_START_INDEX, SLICE_END_INDEX)
    .trim();

  try {
    const fileStats = await stat(filePath);
    if (fileStats.size > 0) {
      await appendToExistingFile(
        filePath,
        fileStats,
        arrayContentWithoutBrackets,
      );
    } else {
      await writeNewFile(filePath, formattedJsonArray);
    }
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === ERROR_CODE_FILE_NOT_FOUND) {
      try {
        await writeNewFile(filePath, formattedJsonArray);
      } catch (createError) {
        console.error(`${ERROR_MESSAGE_CREATE_FILE} ${filePath}:`, createError);
      }
    } else {
      console.error(`${ERROR_MESSAGE_UNEXPECTED_ERROR} ${filePath}:`, error);
    }
  }
};
