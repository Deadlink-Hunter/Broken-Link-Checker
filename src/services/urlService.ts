import axios, { AxiosResponse } from "axios";
import {
  FAILED_REQUEST,
  HTTP_TIMEOUT,
  INVALID_URL_FORMAT,
  MAX_REDIRECTS,
  SOFT_404_DETECTED,
} from "@constant";
import { HTML_TITLE_REGEX } from "@/utils/regexUtils";

export interface UrlCheckResult {
  url: string;
  isBroken: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isSoft404 = (response: AxiosResponse): boolean => {
  const contentType = String(response.headers["content-type"] || "");
  if (!contentType.includes("text/html")) return false;

  const body: string = response.data;
  if (typeof body !== "string" || !body.trim()) return false;
  const titleMatch = body.match(HTML_TITLE_REGEX);
  const title = titleMatch?.[1]?.toLowerCase() ?? "";

  const finalUrl = response.request?.res?.responseUrl ?? "";

  return (
    title.includes("404") ||
    title.includes("not found") ||
    finalUrl.includes("/404")
  );
};

export const checkUrl = async (url: string): Promise<UrlCheckResult> => {
  const startTime = Date.now();

  try {
    if (!isValidUrl(url)) {
      return {
        url,
        isBroken: true,
        error: INVALID_URL_FORMAT,
      };
    }

    const response: AxiosResponse = await axios.get(url, {
      timeout: HTTP_TIMEOUT,
      validateStatus: (status) => status < 400,
      maxRedirects: MAX_REDIRECTS,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const responseTime = Date.now() - startTime;

    if (isSoft404(response)) {
      return {
        url,
        isBroken: true,
        statusCode: response.status,
        error: SOFT_404_DETECTED,
        responseTime,
      };
    }

    return {
      url,
      isBroken: false,
      statusCode: response.status,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    return {
      url,
      isBroken: true,
      statusCode: error.response?.status,
      error: error.message || FAILED_REQUEST,
      responseTime,
    };
  }
};

export const checkMultipleUrls = async (
  urls: string[],
): Promise<UrlCheckResult[]> => {
  const promises = urls.map((url) => checkUrl(url));
  return Promise.all(promises);
};
