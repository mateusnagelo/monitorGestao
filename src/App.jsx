import { useState, useEffect } from 'react';
import DashboardMetrics from './DashboardMetrics';
import ConfigScreen from './ConfigScreen';
import QueryScreen from './QueryScreen';
import { DbContext } from './DbContext';

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [dbConfig, setDbConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    alert('Configurações salvas e aplicadas com sucesso! A página será recarregada.');
    window.location.reload(); // Força o recarregamento da página
  };

  const handleBackFromConfig = () => {
    setCurrentView('dashboard');
  };

  return (
    <DbContext.Provider value={{ dbConfig, setDbConfig }}>
      <div className="App">
        <header className="app-header">
          <span className="logo">VisionApp</span>
          <div>
            <button onClick={() => setCurrentView('query')} className="config-button">SQL</button>
            <button onClick={() => setCurrentView('config')} className="config-button">⚙️</button>
          </div>
        </header>
        <main>
          {currentView === 'main' && (
            <DashboardMetrics 
              isLoading={isLoading} 
            />
          )}
          {currentView === 'config' && <ConfigScreen onSave={handleSaveConfig} onBack={handleBackFromConfig} />}
          {currentView === 'query' && <QueryScreen />}
        </main>
      </div>
    </DbContext.Provider>
  );
}

export default App;