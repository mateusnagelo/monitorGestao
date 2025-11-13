import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { DbContext } from './DbContext';

function MetricCard({ title, data }) {
  const formatValue = (value) => {
    if (typeof value === 'number' && title !== 'Quant. Atendimentos') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return value;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {key}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {formatValue(value)}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardMetrics({ isLoading }) {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const { dbConfig } = useContext(DbContext);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!dbConfig) {
        return;
      }

      setError('');
      setMetrics(null);
      try {
        const response = await axios.post('/.netlify/functions/dashboard-metrics', dbConfig);
        setMetrics(response.data);
      } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error);
        setError('Não foi possível carregar as métricas. Verifique a configuração e a conexão.');
      }
    };

    fetchMetrics();
  }, [dbConfig]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dbConfig) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Por favor, clique no ícone de engrenagem ⚙️ para configurar a conexão com o banco de dados.
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando métricas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
      {metrics && Object.entries(metrics).map(([title, data]) => (
        <Box key={title} sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
          <MetricCard title={title} data={data} />
        </Box>
      ))}
    </Box>
  );
}

export default DashboardMetrics;