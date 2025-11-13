import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Snackbar,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { Settings, Assessment, Home } from '@mui/icons-material';
import DashboardMetrics from './DashboardMetrics';
import ConfigScreen from './ConfigScreen';
import QueryScreen from './QueryScreen';
import { DbContext } from './DbContext';
import { useIsMobile } from './useIsMobile';

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [dbConfig, setDbConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('dbConfig');
      if (savedConfig) {
        setDbConfig(JSON.parse(savedConfig));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveConfig = (newConfig) => {
    setDbConfig(newConfig);
    localStorage.setItem('dbConfig', JSON.stringify(newConfig));
    setSnackbarMessage('Configurações salvas! A página será recarregada.');
    setSnackbarOpen(true);
    setTimeout(() => window.location.reload(), 2000);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleNavigationChange = (event, newValue) => {
    setCurrentView(newValue);
  };

  return (
    <DbContext.Provider value={{ dbConfig, setDbConfig }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ConsultasApp
            </Typography>
            {!isMobile && (
              <>
                <IconButton color="inherit" onClick={() => setCurrentView('main')}>
                  <Home />
                </IconButton>
                <IconButton color="inherit" onClick={() => setCurrentView('query')}>
                  <Assessment />
                </IconButton>
                <IconButton color="inherit" onClick={() => setCurrentView('config')}>
                  <Settings />
                </IconButton>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ flexGrow: 1, mt: 4, mb: isMobile ? 8 : 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {currentView === 'main' && <DashboardMetrics isLoading={isLoading} />}
          {currentView === 'config' && <ConfigScreen onSave={handleSaveConfig} />}
          {currentView === 'query' && <QueryScreen />}
        </Container>

        {isMobile && (
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
              showLabels
              value={currentView}
              onChange={handleNavigationChange}
            >
              <BottomNavigationAction label="Início" value="main" icon={<Home />} />
              <BottomNavigationAction label="Consulta" value="query" icon={<Assessment />} />
              <BottomNavigationAction label="Ajustes" value="config" icon={<Settings />} />
            </BottomNavigation>
          </Paper>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />

        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              vr 1.0.0 - Desenvolvido por VisionApp by Mateus Angelo
            </Typography>
          </Container>
        </Box>
      </Box>
    </DbContext.Provider>
  );
}

export default App;