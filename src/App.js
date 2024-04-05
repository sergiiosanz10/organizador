import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/login';
import Menu from './components/menu';

function App() {
  const [isLogged, setIsLogged] = useState(false);

  const acceder = (estado) => {
    setIsLogged(estado);
  }

  const logout = () => {
    localStorage.removeItem('token');
    setIsLogged(false);
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLogged ? <Navigate to="/" /> : <Login acceder={acceder} />} />
        <Route path="/" element={!isLogged ? <Navigate to="/login" /> : <Menu acceder={acceder} />} />
      </Routes>
    </Router>
  );
}

export default App;