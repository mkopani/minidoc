import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import theme from '@/styles/theme';

interface Props {
  children: React.ReactNode;
}

const ThemeProvider = (props: Props) => {
  // TODO: Add light/dark mode support

  return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>;
};

export default ThemeProvider;
