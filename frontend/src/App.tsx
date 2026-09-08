import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header.jsx';


function App() {
  const [count, setCount] = useState(0)

  return (
    <Header pagina01="inicio" pagina02="Minhas funcionalidades" pagina03="Vagas" />

  )

}

export default App
