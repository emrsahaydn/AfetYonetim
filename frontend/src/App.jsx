import { useState } from 'react';
import Dashboard from './components/Dashboard';
import HelpRequestForm from './components/HelpRequestForm';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleFormSuccess = () => {
    setShowDashboard(true);
  };

  if (!showDashboard) {
    return <HelpRequestForm onSuccess={handleFormSuccess} />;
  }

  return <Dashboard />;
}

export default App;
