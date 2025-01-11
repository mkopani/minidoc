import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Footer from "./Footer";
import Header from "./Header";

interface Props {
  children: React.ReactNode;
}

const Layout = (props: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // TODO: Verify
      }}
    >
      <Header />
      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 5 }}>
        {props.children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
