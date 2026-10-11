import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, info) => {
        console.error('[App Crash]', error, info)
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
