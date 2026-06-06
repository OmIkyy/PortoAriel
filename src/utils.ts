import { DEFAULT_PORTFOLIO_DATA } from './data';
import { PortfolioData } from './types';

const STORAGE_KEY = 'ariel_portfolio_data_v2';

export function loadPortfolioData(): PortfolioData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored portfolio data, resetting to default.", e);
    }
  }
  // Initialize with default data
  savePortfolioData(DEFAULT_PORTFOLIO_DATA);
  return DEFAULT_PORTFOLIO_DATA;
}

export function savePortfolioData(data: PortfolioData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetPortfolioData(): PortfolioData {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  return DEFAULT_PORTFOLIO_DATA;
}
