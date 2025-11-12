import React, { useState, useEffect } from 'react';

function ValorVendas({ onNavigate }) {
  const [vendas, setVendas] = useState({ Dia: 0, Mês: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const savedConfigs = localStorage.getItem('dbConfigs');
        if (!savedConfigs) {
          setError('Nenhuma configuração de banco de dados salva.');
          return;
        }
        
        const parsedConfigs = JSON.parse(savedConfigs);
        const dbConfig = parsedConfigs.cloud; // ou a lógica para selecionar a config

        const response = await fetch('/api/dashboard-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dbConfig }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Erro ao buscar os dados de vendas');
        }

        const data = await response.json();
        setVendas(data['Valor Vendas'] || { Dia: 0, Mês: 0 });
        setError(null);
      } catch (err) {
        setError(err.message);
        setVendas({ Dia: 0, Mês: 0 });
      }
    };

    fetchVendas();
  }, []);

  return (
    <div className="card" onClick={onNavigate}>
      <div className="card-header">
        <span>Valor Vendas</span>
      </div>
      <div className="card-body">
        {error ? (
          <div className="test-result error">{error}</div>
        ) : (
          <>
            <div className="card-row">
              <span>Dia:</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendas.Dia)}</span>
            </div>
            <div className="card-row">
              <span>Mês:</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendas.Mês)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ValorVendas;