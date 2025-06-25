import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios'; // Enable credentials for all requests

axios.defaults.withCredentials = true; // ✅ Enable credentials for all requests

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />);
