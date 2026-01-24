-- Fix: Recreate view with security_invoker to address security definer warning
DROP VIEW IF EXISTS public.store_status;
CREATE VIEW public.store_status 
WITH (security_invoker = on)
AS
SELECT 
  id,
  is_open,
  open_time,
  close_time,
  closed_days,
  manual_override,
  delivery_time_minutes,
  pickup_time_minutes,
  minimum_order,
  delivery_fee
FROM public.store_settings
LIMIT 1;