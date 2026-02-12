-- Allow admins to delete chat messages (for clearing chat when order is delivered)
CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));