import React, { useState, useEffect } from 'react';

function ConfigScreen({ onSave, onBack }) {
  const [configs, setConfigs] = useState({
    local: { host: '', port: '', user: '', password: '', database: '' },
    cloud: { host: '', port: '', user: '', password: '', database: '' },
  });
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('local');

  const handleConfigChange = (env, field, value) => {
    setConfigs(prev => ({ ...prev, [env]: { ...prev[env], [field]: value } }));
  };

  const handleSave = () => {
    const configToSave = configs[activeTab];
    onSave(configToSave);
  };

  const testConnection = async (env) => {
    const config = configs[env];
    setTestResult(null);
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbConfig: config }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Erro no servidor');
      }
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: `Erro ao testar a conexão: ${error.message}` });
    }
  };

  return (
    <div className="config-screen">
      <header className="app-header">
        <h1>Configurações do Banco de Dados</h1>
        <button onClick={onBack} className="back-button">Voltar</button>
      </header>
      <div className="tabs">
        <button onClick={() => setActiveTab('local')} className={activeTab === 'local' ? 'active' : ''}>Local</button>
        <button onClick={() => setActiveTab('cloud')} className={activeTab === 'cloud' ? 'active' : ''}>Cloud</button>
      </div>
      <main>
        {['local', 'cloud'].map(env => (
          <div key={env} className={`config-section ${activeTab === env ? 'active' : ''}`}>
            {Object.keys(configs[env]).map(field => (
              <div key={field} className="form-group">
                <label>{field}</label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  value={configs[env][field]}
                  onChange={e => handleConfigChange(env, field, e.target.value)}
                  placeholder={field === 'port' ? 'ex: 3306' : ''}
                />
              </div>
            ))}
            <button onClick={() => testConnection(env)}>Testar Conexão</button>
          </div>
        ))}
      </main>
      <button onClick={handleSave} className="save-button">Salvar e Aplicar Configurações</button>
      {testResult && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          {testResult.message}
        </div>
      )}
    </div>
  );
}

export default ConfigScreen;