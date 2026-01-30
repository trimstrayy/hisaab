-- Create farmers table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_no INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  fixed_rate DECIMAL(10,2) NOT NULL DEFAULT 16.0,
  advance_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_logs table
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL, -- BS date format YYYY-MM-DD
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  farmer_no INTEGER NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'evening')),
  milk DECIMAL(10,2) NOT NULL DEFAULT 0,
  fat DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, farmer_id, shift)
);

-- Create advances table
CREATE TABLE public.advances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  farmer_no INTEGER NOT NULL,
  date TEXT NOT NULL, -- BS date format
  amount DECIMAL(10,2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public access for now since no auth yet)
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

-- Create public access policies (since this is a local dairy management system)
CREATE POLICY "Allow public read access to farmers" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to farmers" ON public.farmers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to farmers" ON public.farmers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to farmers" ON public.farmers FOR DELETE USING (true);

CREATE POLICY "Allow public read access to daily_logs" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to daily_logs" ON public.daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to daily_logs" ON public.daily_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to daily_logs" ON public.daily_logs FOR DELETE USING (true);

CREATE POLICY "Allow public read access to advances" ON public.advances FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to advances" ON public.advances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to advances" ON public.advances FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to advances" ON public.advances FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample farmers
INSERT INTO public.farmers (farmer_no, name, fixed_rate, advance_balance) VALUES
  (1, 'राम बहादुर', 16.0, 0),
  (2, 'श्याम कुमार', 16.0, 500),
  (3, 'हरि प्रसाद', 16.0, 0),
  (4, 'कृष्ण माया', 16.0, 1000),
  (5, 'सीता देवी', 16.0, 0),
  (6, 'गोपाल सिंह', 16.0, 0),
  (7, 'बिष्णु थापा', 16.0, 250),
  (8, 'लक्ष्मी श्रेष्ठ', 16.0, 0);