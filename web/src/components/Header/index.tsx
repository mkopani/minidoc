import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import api, { refreshCSRFToken } from '@/api';
import { clearUser } from '@/slices/user';
import { type RootState } from '@/store';

import NavButton from './NavButton';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentTheme = useTheme();
  const theme = createTheme({
    ...currentTheme,
    palette: {
      primary: {
        main: '#FFFFFF',
      },
    },
  });

  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = Boolean(user.token);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // TODO: Improve error handling
      console.error(error);
    }

    // Clear user data from store
    dispatch(clearUser());
    // Refresh CSRF token
    await refreshCSRFToken();
    // Redirect user to login
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <NavLink
                to="/"
                style={{ textDecoration: 'none', color: 'white' }}
              >
                MiniDoc
              </NavLink>
            </Typography>

            <ThemeProvider theme={theme}>
              {isAuthenticated ? (
                <NavButton onClick={handleLogout}>Logout</NavButton>
              ) : (
                <NavLink to="/login" style={{ textDecoration: 'none' }}>
                  <NavButton>Login</NavButton>
                </NavLink>
              )}
            </ThemeProvider>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
