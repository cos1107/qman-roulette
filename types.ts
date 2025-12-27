
export type OptionType = 'text' | 'image';

export type ThemeId = 'classic' | 'royal' | 'emerald';

export interface Option {
  id: string;
  type: OptionType;
  content: string; // text or base64
  label?: string;
}

export interface WheelConfig {
  name: string;
  options: Option[];
  themeId: ThemeId;
}

export interface SpinResult {
  option: Option;
  index: number;
}
