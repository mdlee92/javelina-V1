import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { awsConfig } from './aws-config'
import AppRouter from './AppRouter.tsx'
import './index.css'

// Debug: Check environment variables
console.log('Environment variables:', {
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
  VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
  VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
});

console.log('AWS Config:', awsConfig);

// Configure Amplify with AWS resources
Amplify.configure(awsConfig)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
