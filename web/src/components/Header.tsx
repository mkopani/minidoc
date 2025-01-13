import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Container maxWidth="xl">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <NavLink to="/" style={{ textDecoration: 'none', color: 'white' }}>
              MiniDoc
            </NavLink>
          </Typography>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
