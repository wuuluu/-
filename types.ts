export enum TranslateMode {
  COMMENTS_ONLY = 'COMMENTS_ONLY',
  FULL = 'FULL' // Comments + Strings + Variables
}

export interface TranslationState {
  originalCode: string;
  translatedCode: string;
  isTranslating: boolean;
  error: string | null;
  mode: TranslateMode;
  language: string;
}

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'sql',
  'html',
  'css',
  'json'
];