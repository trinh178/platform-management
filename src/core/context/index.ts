import { createContext } from 'react';
import _ from 'lodash';
import { AppTheme } from '../theme';
import * as themes from '@/styles/themes';

export interface AppContextProps {
  selectedTheme: AppTheme;
  themes: AppTheme[];
  selectTheme: (theme: AppTheme) => void;
}

export const defaultValue: AppContextProps = {
  selectedTheme: themes.default,
  themes: Object.values(_.omit(themes, 'default')),
  selectTheme: () => undefined,
};

export const AppContext = createContext(defaultValue);

export const appContextValueRef = {
  current: defaultValue,
};
