import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ConfigScreen({ onSave }) {
  const [configs, setConfigs] = useState({
    local: { host: '', port: '', user: '', password: '', database: '' },
    cloud: { host: '', port: '', user: '', password: '', database: '' },
  });
  const [testResult, setTestResult] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loadingTest, setLoadingTest] = useState(false);

  useEffect(() => {
    const savedConfigs = localStorage.getItem('dbConfigs');
    if (savedConfigs) {
      try {
        setConfigs(JSON.parse(savedConfigs));
      } catch (e) {
        console.error("Falha ao carregar as configurações.");
      }
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setTestResult(null); // Limpa o resultado do teste ao trocar de aba
  };

  const handleConfigChange = (env, field, value) => {
    setConfigs(prev => ({ ...prev, [env]: { ...prev[env], [field]: value } }));
  };

  const handleSave = () => {
    localStorage.setItem('dbConfigs', JSON.stringify(configs));
    const activeEnv = tabValue === 0 ? 'local' : 'cloud';
    onSave(configs[activeEnv]);
  };

  const testConnection = async () => {
    const activeEnv = tabValue === 0 ? 'local' : 'cloud';
    const config = configs[activeEnv];
    setLoadingTest(true);
    setTestResult(null);
    try {
      const response = await axios.post('/.netlify/functions/test-connection');
      setTestResult(response.data);
    } catch (error) {
      setTestResult({ success: false, message: `Erro: ${error.response?.data?.message || error.message}` });
    } finally {
      setLoadingTest(false);
    }
  };

  const renderFields = (env) => (
    <Box component="form" noValidate autoComplete="off">
      {Object.keys(configs[env]).map(field => (
        <TextField
          key={field}
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          type={field === 'password' ? 'password' : 'text'}
          value={configs[env][field]}
          onChange={e => handleConfigChange(env, field, e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      ))}
    </Box>
  );

  return (
    <Paper sx={{ p: 2, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Configurações do Banco de Dados
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="abas de configuração" variant="scrollable" scrollButtons="auto">
          <Tab label="Local" id="config-tab-0" />
          <Tab label="Cloud" id="config-tab-1" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        {renderFields('local')}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderFields('cloud')}
      </TabPanel>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          onClick={testConnection}
          variant="outlined"
          disabled={loadingTest}
          startIcon={loadingTest ? <CircularProgress size={20} /> : null}
        >
          {loadingTest ? 'Testando...' : 'Testar Conexão'}
        </Button>

        {testResult && (
          <Alert severity={testResult.success ? 'success' : 'error'}>
            {testResult.message}
          </Alert>
        )}

        <Button onClick={handleSave} variant="contained" color="primary">
          Salvar e Aplicar
        </Button>
      </Box>
    </Paper>
  );
}

export default ConfigScreen;