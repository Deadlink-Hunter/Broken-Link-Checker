export const getMaxUrlsExceededMessage = (maxUrls: number) =>
  `Maximum ${maxUrls} URLs allowed per request`;

export const getMultipleUrlsCheckSummary = (working: number, broken: number) =>
  `URL check completed - ${working} working, ${broken} broken`;
