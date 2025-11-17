export interface Environment {
  firebaseConfig: {
    projectId: string;
    appId: string;
    storageBucket: string;
    apiKey: string;
    authDomain: string;
    messagingSenderId: string;
  };
}

export const environment: Environment = {
  firebaseConfig: {
    projectId: 'YOUR_PROJECT_ID',
    appId: 'YOUR_APP_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  },
};

