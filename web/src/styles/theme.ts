import { createTheme } from "@mui/material/styles";
import { blueGrey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[500],
    },
    secondary: {
      main: blueGrey[900],
    }
  }
});

export default theme;
