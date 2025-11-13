import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { DbContext } from './DbContext';

function QueryScreen() {
  const [query, setQuery] = useState('SELECT * FROM INFORMATION_SCHEMA.TABLES;');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { dbConfig } = useContext(DbContext);

  const executeQuery = async () => {
    if (!dbConfig) {
      setError('A configuração do banco de dados não está carregada.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('/.netlify/functions/query', { query, dbConfig });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao executar a consulta');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dbConfig) {
      setError("Nenhuma configuração de banco de dados encontrada. Por favor, configure primeiro na tela de configurações. ⚙️");
    }
  }, [dbConfig]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Executar Consulta SQL
      </Typography>
      <TextField
        label="Consulta SQL"
        multiline
        rows={6}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        disabled={!dbConfig || loading}
      />
      <Button
        onClick={executeQuery}
        variant="contained"
        disabled={!dbConfig || loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Executando...' : 'Executar'}
      </Button>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {results && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Resultados</Typography>
          {results.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {Object.keys(results[0]).map((key) => (
                        <TableCell key={key} sx={{ fontWeight: 'bold' }}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>
                            {value && value.type === 'Buffer'
                              ? '[Buffer]'
                              : (typeof value === 'object' && value !== null ? JSON.stringify(value) : value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>Nenhum resultado encontrado.</Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

export default QueryScreen;