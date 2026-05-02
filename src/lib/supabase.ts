import { createClient } from "@supabase/supabase-js";
import { Transaction } from "@/types/finance";

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Partial<Omit<Transaction, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente do Supabase não foram definidas.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
