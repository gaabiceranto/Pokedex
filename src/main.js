import './styles/main.scss';
import { App } from './js/App.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.classList.add('loaded');
  }

  const app = new App();
  app.init();
});





