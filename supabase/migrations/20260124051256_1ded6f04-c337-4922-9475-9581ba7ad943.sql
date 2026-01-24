-- Create drinks category
INSERT INTO public.categories (id, name, description, display_order, is_active)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bebidas', 'Refrigerantes e sucos', 3, true)
ON CONFLICT DO NOTHING;

-- Add drink_type column to products for distinguishing between refrigerantes and sucos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS drink_type text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_label text;

-- Add delivery_fee to store_settings
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 5;

-- Update store_status view to include delivery_fee
DROP VIEW IF EXISTS public.store_status;
CREATE VIEW public.store_status AS
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