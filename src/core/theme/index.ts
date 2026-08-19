export interface AppTheme {
  name: string;
  color: string;
}

export type AppThemeOptions = AppTheme;

export function createAppTheme(options: AppThemeOptions) {
  return options; // TODO
}
