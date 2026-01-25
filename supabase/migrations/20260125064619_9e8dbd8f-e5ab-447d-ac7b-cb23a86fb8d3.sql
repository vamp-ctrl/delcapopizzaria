-- Add free_delivery and pizza_count columns to combos
ALTER TABLE public.combos 
ADD COLUMN IF NOT EXISTS free_delivery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pizza_count integer DEFAULT 1;

-- Create atomic function for coupon validation and usage
CREATE OR REPLACE FUNCTION public.validate_and_use_coupon(
  p_coupon_code text,
  p_order_total numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon record;
  v_result json;
BEGIN
  -- Lock the coupon row for update to prevent race conditions
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = p_coupon_code
  AND is_active = true
  FOR UPDATE;
  
  -- Check if coupon exists
  IF v_coupon IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Cupom não encontrado');
  END IF;
  
  -- Check expiration
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN json_build_object('valid', false, 'error', 'Cupom expirado');
  END IF;
  
  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.uses_count >= v_coupon.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'Cupom esgotado');
  END IF;
  
  -- Check minimum order value
  IF v_coupon.min_order_value IS NOT NULL AND p_order_total < v_coupon.min_order_value THEN
    RETURN json_build_object('valid', false, 'error', 'Valor mínimo não atingido');
  END IF;
  
  -- Increment usage count atomically
  UPDATE public.coupons
  SET uses_count = uses_count + 1
  WHERE id = v_coupon.id;
  
  -- Return coupon details
  RETURN json_build_object(
    'valid', true,
    'id', v_coupon.id,
    'code', v_coupon.code,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.validate_and_use_coupon TO authenticated;