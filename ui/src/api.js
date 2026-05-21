/**
 * api.js — Central API Configuration
 *
 * Why this file exists:
 * Right now Flask runs on localhost:5000 (your machine).
 * When we deploy to production, Flask will be at https://api.jobsearchsucks.fyi
 * Instead of hunting down every axios call across every file,
 * we change ONE line here and everything updates.
 *
 * Usage in any page:
 *   import { api } from '../api';
 *   const res = await api.post('/screener/analyze', { jd_text: '...' });
 */

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60 seconds — Claude can be slow on long JDs
});
