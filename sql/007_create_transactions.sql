-- =============================================
-- TRANSACTIONS TABLE
-- =============================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 0) NOT NULL,
  plan TEXT NOT NULL,           -- 'monthly' | 'yearly' | 'lifetime'
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_code TEXT UNIQUE NOT NULL, -- The unique code for bank transfer content (e.g. VIP12345)
  gateway_transaction_id TEXT,   -- ID from the payment gateway/bank webhook
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_payment_code ON public.transactions(payment_code);

-- RLS Policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions" ON public.transactions
    FOR ALL USING (TRUE) WITH CHECK (TRUE);
