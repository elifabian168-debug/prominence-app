import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import Prominence from './Prominence.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Prominence />
  </StrictMode>,
)
