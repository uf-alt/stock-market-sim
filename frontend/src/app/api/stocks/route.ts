import { NextResponse } from "next/server";
import { STOCKS } from "@/lib/mock-data";

const TICKERS = STOCKS.map((s) => s.ticker);

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json([]);
  }

  try {
    const results = await Promise.all(
      TICKERS.map(async (ticker) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 30 } });
        const data = await res.json();
        return {
          ticker,
          price: data.c ?? 0,
          change: data.d ?? 0,
          changePct: data.dp ?? 0,
        };
      })
    );
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
