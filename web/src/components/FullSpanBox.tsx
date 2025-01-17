import Box, { BoxProps } from '@mui/material/Box';

const FullSpanBox = (props: BoxProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center"
      {...props}
    />
  );
}

export default FullSpanBox;
