import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import api from '@/api';
import Layout from '@/components/Layout';
import { setUser } from '@/slices/user';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login/', {
        username,
        password,
      });

      console.log('data', data);

      // Save user data to store
      dispatch(setUser({ username: data.username, token: data.token }));

      // Redirect user to home page
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <Paper variant="outlined" sx={{ width: 400, padding: 3 }}>
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Login
            </Typography>

            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              fullWidth
            />

            <TextField
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              fullWidth
            />

            {error && (
              <Alert severity="error" sx={{ width: '100%', marginTop: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ marginTop: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="primary" />
              ) : (
                'Login'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default LoginPage;
