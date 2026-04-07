CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE representatives (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_shift TEXT NOT NULL CHECK (base_shift IN ('DAY', 'NIGHT')),
  base_schedule JSONB NOT NULL,
  mix_profile JSONB,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weekly_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  agents JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  representative_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('AUSENCIA','TARDANZA','LICENCIA','VACACIONES','ERROR','OTRO')),
  date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE swaps (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('COVER','DOUBLE','SWAP')),
  date DATE NOT NULL,
  agent_a TEXT NOT NULL,
  agent_b TEXT,
  shift TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coverage_rules (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL','SHIFT','DATE')),
  shift TEXT,
  date DATE,
  required INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_data" ON representatives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_data" ON weekly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_data" ON incidents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_data" ON swaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_data" ON coverage_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_data" ON audit_log FOR ALL USING (auth.uid() = user_id);
