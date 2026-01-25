-- Add configuration fields to combos so admin can predefine allowed pizza flavors and drinks per promotion
ALTER TABLE public.combos
ADD COLUMN IF NOT EXISTS pizza_size text NULL,
ADD COLUMN IF NOT EXISTS allowed_flavor_ids uuid[] NULL,
ADD COLUMN IF NOT EXISTS allowed_drink_ids uuid[] NULL;

-- Helpful indexes for array membership queries (optional but good for performance)
CREATE INDEX IF NOT EXISTS idx_combos_allowed_flavor_ids ON public.combos USING GIN (allowed_flavor_ids);
CREATE INDEX IF NOT EXISTS idx_combos_allowed_drink_ids ON public.combos USING GIN (allowed_drink_ids);