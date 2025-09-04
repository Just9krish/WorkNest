-- Add description field to calendar_events table
ALTER TABLE public.calendar_events 
ADD COLUMN description TEXT;
