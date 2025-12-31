import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { awsConfig } from './aws-config'
import AppRouter from './AppRouter.tsx'
import './index.css'

// Configure Amplify with AWS resources
Amplify.configure(awsConfig)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
