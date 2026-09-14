import { useRef } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import LandingPage from './pages/LandingPage.jsx'
import useScrollReveal from './hooks/useScrollReveal.js'
import './App.css'

function App() {
  const pageRef = useRef<HTMLDivElement>(null)
  useScrollReveal(pageRef)

  return (
    <div ref={pageRef}>
      <div className="scroll-progress" aria-hidden="true" />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <LandingPage />
      </main>
      <Footer />
    </div>
  )
}

export default App
