-- Add a sequence for generating unique numbers for display_id
CREATE SEQUENCE IF NOT EXISTS public.estimate_display_id_seq;

-- Add the display_id column to the estimates table
ALTER TABLE public.estimates
ADD COLUMN display_id TEXT UNIQUE;

-- Create a function to generate the TSW- prefixed display_id
CREATE OR REPLACE FUNCTION public.generate_estimate_display_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id INT;
BEGIN
    -- Get the next value from the sequence
    SELECT nextval('public.estimate_display_id_seq') INTO next_id;
    -- Format the display_id
    NEW.display_id := 'TSW - ' || LPAD(next_id::TEXT, 6, '0'); -- e.g., TSW - 000001
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before inserting a new estimate
CREATE TRIGGER set_estimate_display_id
BEFORE INSERT ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION public.generate_estimate_display_id();

-- Optional: Populate display_id for existing estimates
-- This block should only be run once if you have existing data
DO $$
DECLARE
    r RECORD;
    next_id INT;
BEGIN
    -- Get the current sequence value to ensure new IDs are unique
    SELECT last_value FROM public.estimate_display_id_seq INTO next_id;
    IF next_id IS NULL THEN
        next_id := 0;
    END IF;

    FOR r IN SELECT id FROM public.estimates WHERE display_id IS NULL LOOP
        next_id := next_id + 1;
        UPDATE public.estimates
        SET display_id = 'TSW - ' || LPAD(next_id::TEXT, 6, '0')
        WHERE id = r.id;
    END LOOP;
    -- Set the sequence to the next available value after populating existing data
    PERFORM setval('public.estimate_display_id_seq', next_id, true);
END;
$$ LANGUAGE plpgsql;
