-- Add delivery time, pickup time and minimum order to store_settings
ALTER TABLE public.store_settings
ADD COLUMN delivery_time_minutes integer NOT NULL DEFAULT 45,
ADD COLUMN pickup_time_minutes integer NOT NULL DEFAULT 20,
ADD COLUMN minimum_order numeric NOT NULL DEFAULT 0;

-- Update the store_status view to include new fields
DROP VIEW IF EXISTS public.store_status;

CREATE VIEW public.store_status WITH (security_invoker = true) AS
SELECT 
  id,
  is_open,
  open_time,
  close_time,
  closed_days,
  manual_override,
  delivery_time_minutes,
  pickup_time_minutes,
  minimum_order
FROM public.store_settings;

-- Grant access to the view
GRANT SELECT ON public.store_status TO anon, authenticated;