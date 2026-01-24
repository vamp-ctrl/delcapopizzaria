-- Drop and recreate the view with SECURITY INVOKER (which is the default, but being explicit)
DROP VIEW IF EXISTS public.store_status;

-- Recreate with explicit SECURITY INVOKER
CREATE VIEW public.store_status 
WITH (security_invoker = true)
AS
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

-- Also need to allow the view to read from the underlying table
-- Create a policy that allows reading through the view for public status
CREATE POLICY "Public can view store status via view"
ON public.store_settings
FOR SELECT
USING (true);

-- Drop the admin-only policy we created (it would conflict)
DROP POLICY IF EXISTS "Only admins can view full store settings" ON public.store_settings;