import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import api from '@/api';
import { clearUser } from '@/slices/user';
import { type RootState } from '@/store';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

    // Redirect user to login
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <NavLink to="/" style={{ textDecoration: 'none', color: 'white' }}>
                MiniDoc
              </NavLink>
            </Typography>

            {isAuthenticated ? (
              <Button onClick={handleLogout} color="secondary">
                Logout
              </Button>
            ) : (
              <NavLink
                to="/login"
                style={{ textDecoration: 'none', color: 'white' }}
              >
                Login
              </NavLink>
            )}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
