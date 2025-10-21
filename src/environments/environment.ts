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
    projectId: 'da-join-9d181',
    appId: '1:721333674443:web:da7f7d606be244b87f164e',
    storageBucket: 'da-join-9d181.firebasestorage.app',
    apiKey: 'AIzaSyA4jzYL5aR_PGKEe93amwt0KRS2TpBwLSY',
    authDomain: 'da-join-9d181.firebaseapp.com',
    messagingSenderId: '721333674443',
  },
};