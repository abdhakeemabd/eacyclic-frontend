import React, { useEffect } from 'react';
import './App.css';
import './index.css';
import HomeRoutes from './routes';
import { warmupBackend } from './utils/api';

function App() {
  useEffect(() => {
    warmupBackend();
  }, []);

  return <HomeRoutes />;
}

export default App;
