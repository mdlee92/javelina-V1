export const awsConfig = {
  Auth: {
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
  },
  API: {
    endpoints: [
      {
        name: 'ERNotesAPI',
        endpoint: import.meta.env.VITE_API_ENDPOINT || '',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    ],
  },
};
