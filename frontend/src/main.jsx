import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './assets/css/Global.css'
// Make sure all style modules are loaded properly
import './assets/css/auth-common.css'
import './assets/css/signup.module.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
