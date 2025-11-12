import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DbContext } from './DbContext';

function Card({ title, data }) {
  const formatValue = (key, value) => {
    if (typeof value === 'number') {
      if (key.includes('Valor Vendas') || key.includes('Ticket') || key.includes('Desctos') || key.includes('Compras')) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      }
      return value;
    }
    return value;
  };

  return (
    <div className="card">
      <div className="card-header">
        {title}
      </div>
      <div className="card-body">
        {Object.entries(data).map(([key, value]) => (
          <div className="card-row" key={key}>
            <span>{key}:</span>
            <span>{formatValue(title, value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardMetrics({ onNavigateToVendasDetalhes, isLoading }) {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const { dbConfig } = useContext(DbContext);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!dbConfig) {
        return;
      }

      setError(null);
      setMetrics(null); // Limpa as métricas antigas, mostrando a mensagem de "carregando"
      try {
        const response = await axios.post('http://localhost:3001/api/dashboard-metrics', dbConfig);
        setMetrics(response.data);
      } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error);
        setError('Não foi possível carregar as métricas. Verifique a configuração e a conexão.');
      }
    };

    fetchMetrics();
  }, [dbConfig]);

  if (isLoading) {
    return <div className="info-message" style={{ color: 'black' }}>Carregando configurações...</div>;
  }

  if (!dbConfig) {
    return <div className="info-message" style={{ color: 'black' }}>Por favor, clique no ícone de engrenagem ⚙️ para configurar a conexão com o banco de dados.</div>;
  }

  if (error) {
    return <p className="error" style={{ color: 'red', padding: '10px' }}>{error}</p>;
  }

  if (!metrics) {
    return <div className="info-message" style={{ color: 'black' }}>Carregando métricas...</div>;
  }

  return (
    <div className="dashboard">
      <div className="cards-container">
        {Object.entries(metrics).length > 0 ? (
          Object.entries(metrics).map(([title, data]) => (
            <Card 
              key={title} 
              title={title} 
              data={data} 
            />
          ))
        ) : (
          <div className="info-message" style={{ color: 'black' }}>Nenhuma métrica para exibir.</div>
        )}
      </div>
    </div>
  );
}

export default DashboardMetrics;