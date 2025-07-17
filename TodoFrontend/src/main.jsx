import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // App bileşenini doğru yerden çekiyor mu?
import './index.css' // Global stil dosyasını çekiyor mu?

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* App bileşeni render ediliyor mu? */}
  </React.StrictMode>,
)