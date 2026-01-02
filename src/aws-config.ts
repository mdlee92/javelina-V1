import { ResourcesConfig } from 'aws-amplify';

export const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
    },
  },
  API: {
    REST: {
      ERNotesAPI: {
        endpoint: import.meta.env.VITE_API_ENDPOINT || '',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-2',
      },
    },
  },
};
