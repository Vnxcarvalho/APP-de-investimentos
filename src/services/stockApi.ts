import { Quote } from '../types';

const BASE_URL = 'https://brapi.dev/api';
const TOKEN = import.meta.env.VITE_BRAPI_TOKEN || '';

export async function fetchQuotes(tickers: string[]): Promise<Quote[]> {
  if (tickers.length === 0) return [];

  const params = new URLSearchParams({
    token: TOKEN,
    fundamental: 'false',
  });

  const tickerStr = tickers.join(',');
  const url = `${BASE_URL}/quote/${tickerStr}?${params}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar cotações');
    const data = await res.json();

    return (data.results || []).map((r: {
      symbol: string;
      regularMarketPrice: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
      longName?: string;
      logourl?: string;
    }) => ({
      ticker: r.symbol,
      price: r.regularMarketPrice ?? 0,
      change: r.regularMarketChange ?? 0,
      changePercent: r.regularMarketChangePercent ?? 0,
      name: r.longName,
      logoUrl: r.logourl,
    }));
  } catch {
    return tickers.map(t => ({
      ticker: t,
      price: 0,
      change: 0,
      changePercent: 0,
    }));
  }
}

export async function searchTicker(query: string): Promise<{ ticker: string; name: string }[]> {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({ search: query, token: TOKEN });
    const res = await fetch(`${BASE_URL}/quote/list?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.stocks || []).slice(0, 10).map((s: { stock: string; name: string }) => ({
      ticker: s.stock,
      name: s.name,
    }));
  } catch {
    return [];
  }
}
