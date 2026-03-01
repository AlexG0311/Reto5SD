export interface QueryResponse {
  question: string;
  generatedSQL: string;
  rawResults: Record<string, unknown>[];
  naturalLanguageAnswer: string;
}

export interface ApiError {
  error: string;
}
