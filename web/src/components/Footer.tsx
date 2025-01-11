import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        textAlign: 'center',
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} MiniDoc
      </Typography>
    </Box>
  );
};

export default Footer;
