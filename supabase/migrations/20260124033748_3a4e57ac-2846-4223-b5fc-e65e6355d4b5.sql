-- Remove the public SELECT policy from store_settings
DROP POLICY IF EXISTS "Anyone can view store settings" ON public.store_settings;

-- Create a restrictive policy - only admins can SELECT directly from the table
CREATE POLICY "Only admins can view full store settings"
ON public.store_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a secure view that only exposes public-safe fields
CREATE OR REPLACE VIEW public.store_status AS
SELECT 
  id,
  is_open,
  open_time,
  close_time,
  closed_days,
  manual_override
FROM public.store_settings;

-- Grant SELECT on the view to anonymous and authenticated users
GRANT SELECT ON public.store_status TO anon, authenticated;