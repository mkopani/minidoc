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
        minHeight: '100vh',
        height: '100%', // Ensure children can use 100% height
      }}
    >
      <Header />
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
          py: 5,
          height: '100%',
        }}
      >
        {props.children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
