import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.jsx';
import './style.css';
import './otp.css';

class AppErrorBoundary extends React.Component {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch(error, info) { console.error('Taskaura page render failed', error, info); }
  render() {
    if (this.state.failed) return <main className="app-error-state" role="alert">
      <span className="eyebrow">TASKAURA</span>
      <h1>This page couldn’t load.</h1>
      <p>Reload the app to try again. If the issue continues, check the browser console for details.</p>
      <button className="btn primary" onClick={() => window.location.reload()}>Reload app</button>
    </main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppErrorBoundary><App /></AppErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);