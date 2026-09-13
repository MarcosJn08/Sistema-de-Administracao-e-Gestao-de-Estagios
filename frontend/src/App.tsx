import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Header.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Navbar pagina01="Dashboard" pagina02="Vagas" pagina03="Documentos" pagina04="Documentos" pagina05="Documentos" pagina06="Documentos"/>
  )
}

export default App
