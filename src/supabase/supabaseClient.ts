import { createClient } from '@supabase/supabase-js';
import { PortfolioData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if credentials exist to avoid crashing
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const RECORD_ID = 'ariel_portfolio';

/**
 * Fetch portfolio data from Supabase
 */
export async function fetchSupabasePortfolio(): Promise<PortfolioData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('portfolio_data')
      .select('data')
      .eq('id', RECORD_ID)
      .single();

    if (error) {
      console.warn("Could not fetch Supabase data (table might require setup or is empty):", error.message);
      return null;
    }
    return data?.data as PortfolioData;
  } catch (err) {
    console.error("Supabase fetch exception: ", err);
    return null;
  }
}

/**
 * Save portfolio data to Supabase (Upsert / Update)
 */
export async function saveSupabasePortfolio(newData: PortfolioData): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('portfolio_data')
      .upsert({ id: RECORD_ID, data: newData, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      const isTableMissing = error.message.includes('schema cache') || error.message.includes('portfolio_data') || error.code === '42P01';
      if (isTableMissing) {
        console.warn(
          "⚠️ NOTICE: The table 'portfolio_data' was not found in your Supabase schema cache.\n" +
          "To fix this, please follow these steps:\n" +
          "1. Open your Supabase Dashboard (https://supabase.com)\n" +
          "2. Navigate to 'SQL Editor' in the left menu\n" +
          "3. Create a 'New Query' and run the SQL commands defined in '/supabase/schema.sql' to initialize the table!\n" +
          "System message: " + error.message
        );
      } else {
        console.warn("⚠️ Failed to write to Supabase table 'portfolio_data':", error.message);
      }
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("⚠️ Exception during Supabase transaction save: ", err?.message || err);
    return false;
  }
}

/**
 * Subscribe to Supabase real-time updates for table changes
 */
export function subscribeToPortfolioChanges(onUpdate: (newData: PortfolioData) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime_portfolio')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'portfolio_data',
        filter: `id=eq.${RECORD_ID}`
      },
      (payload) => {
        if (payload.new && (payload.new as any).data) {
          onUpdate((payload.new as any).data as PortfolioData);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
