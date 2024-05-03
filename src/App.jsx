import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/login';
import Menu from './components/menu';
import Tareas from './components/tareas';

function App() {

  const [isLogged, setIsLogged] = useState(false);
  const [id,setId] = useState(0);
  const acceder = (estado) => {
    setIsLogged(estado);
  } 

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLogged ? <Navigate to="/" /> : <Login setId={setId} acceder={acceder} />} />
        <Route path="/" element={!isLogged ? <Navigate to="/login" /> : <Menu id={id}  acceder={acceder}  />} />
      </Routes>
    </Router>
  );
}

export default App;