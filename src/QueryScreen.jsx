import React, { useState, useEffect } from 'react';

function QueryScreen({ onBack }) {
  const [query, setQuery] = useState('SHOW TABLES');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [configs, setConfigs] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState('cloud');

  useEffect(() => {
    const savedConfigs = localStorage.getItem('dbConfigs');
    if (savedConfigs) {
      try {
        setConfigs(JSON.parse(savedConfigs));
      } catch (e) {
        setError("Falha ao carregar as configurações do banco de dados.");
      }
    } else {
      setError("Nenhuma configuração de banco de dados encontrada. Por favor, configure primeiro.");
    }
  }, []);

  const executeQuery = async () => {
    if (!configs) {
      setError('As configurações do banco de dados não estão carregadas.');
      return;
    }

    const dbConfig = configs[selectedEnv];

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dbConfig }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao executar a consulta');
      }

      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  return (
    <div className="query-screen">
      <header className="app-header">
        <h1>Executar Consulta SQL</h1>
        <button onClick={onBack} className="back-button">Voltar</button>
      </header>
      <main>
        <div className="form-group">
          <label>Ambiente</label>
          <select value={selectedEnv} onChange={e => setSelectedEnv(e.target.value)}>
            <option value="cloud">Nuvem</option>
            <option value="local">Local</option>
          </select>
        </div>
        <div className="form-group">
          <label>Consulta SQL</label>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows="5"
          />
        </div>
        <button onClick={executeQuery}>Executar</button>
        {error && <div className="test-result error">{error}</div>}
        {results && (
          <div className="results-section">
            <h2>Resultados</h2>
            {results.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {Object.keys(results[0]).map(key => <th key={key}>{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value && value.type === 'Buffer' ? '[Buffer]' : (typeof value === 'object' && value !== null ? JSON.stringify(value) : value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum resultado encontrado.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default QueryScreen;