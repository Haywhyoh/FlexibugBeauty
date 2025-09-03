-- Add enhanced service fields for better client experience and booking requirements
-- Migration: 20250103_add_service_enhancements

-- Add new columns to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS client_instructions TEXT,
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_notes TEXT,
ADD COLUMN IF NOT EXISTS requires_consultation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS complexity_level TEXT DEFAULT 'basic' CHECK (complexity_level IN ('basic', 'intermediate', 'advanced'));

-- Add comments for documentation
COMMENT ON COLUMN services.client_instructions IS 'Instructions for clients - what to bring, how to prepare';
COMMENT ON COLUMN services.preparation_time IS 'Additional preparation time in minutes before service starts';
COMMENT ON COLUMN services.service_notes IS 'Internal notes for service providers';
COMMENT ON COLUMN services.requires_consultation IS 'Whether this service requires a consultation first';
COMMENT ON COLUMN services.cancellation_policy IS 'Specific cancellation policy for this service';
COMMENT ON COLUMN services.complexity_level IS 'Service complexity: basic, intermediate, or advanced';

-- Create service_requirements table for flexible requirements management
CREATE TABLE IF NOT EXISTS service_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('bring', 'avoid', 'prepare', 'medical', 'timing')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for service_requirements
COMMENT ON TABLE service_requirements IS 'Flexible requirements system for services';
COMMENT ON COLUMN service_requirements.requirement_type IS 'Type: bring, avoid, prepare, medical, timing';
COMMENT ON COLUMN service_requirements.title IS 'Short requirement title';
COMMENT ON COLUMN service_requirements.description IS 'Detailed requirement description';
COMMENT ON COLUMN service_requirements.is_mandatory IS 'Whether this requirement is mandatory';
COMMENT ON COLUMN service_requirements.display_order IS 'Order to display requirements';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requirements_service_id ON service_requirements(service_id);
CREATE INDEX IF NOT EXISTS idx_service_requirements_type ON service_requirements(requirement_type);

-- Enable RLS
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;

-- Service requirements policies
DROP POLICY IF EXISTS "Users can view service requirements for active services" ON service_requirements;
CREATE POLICY "Users can view service requirements for active services"
    ON service_requirements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM services 
            WHERE services.id = service_requirements.service_id 
            AND services.is_active = true
        )
    );

DROP POLICY IF EXISTS "Service owners can manage their service requirements" ON service_requirements;
CREATE POLICY "Service owners can manage their service requirements"
    ON service_requirements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM services 
            WHERE services.id = service_requirements.service_id 
            AND services.user_id = auth.uid()
        )
    );

-- Update existing services with some default values for demonstration
UPDATE services 
SET complexity_level = 'basic' 
WHERE complexity_level IS NULL;

-- Add some example requirements for existing services (optional - can be removed)
-- This helps demonstrate the new functionality
INSERT INTO service_requirements (service_id, requirement_type, title, description, is_mandatory, display_order)
SELECT 
    s.id,
    'prepare',
    'Clean Hair Required',
    'Please arrive with clean, dry hair for best results',
    true,
    1
FROM services s 
WHERE s.name ILIKE '%hair%' 
AND NOT EXISTS (
    SELECT 1 FROM service_requirements sr 
    WHERE sr.service_id = s.id
)
LIMIT 5;

-- Add updated_at trigger for service_requirements
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_requirements_updated_at 
    BEFORE UPDATE ON service_requirements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();