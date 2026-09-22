-- ============================================================================
-- Catmon Database Migration: Setup PostGIS & Cats Schema
-- ============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums de Domínio
DO $$ BEGIN
    CREATE TYPE cat_context_enum AS ENUM ('stray', 'friend_pet', 'community', 'cat_cafe', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cat_temperament_enum AS ENUM ('friendly', 'shy', 'playful', 'sleeper');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cat_approx_age_enum AS ENUM ('kitten', 'young', 'adult', 'senior');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabela Principal cats
CREATE TABLE IF NOT EXISTS public.cats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Gato Misterioso',
    breed VARCHAR(100) NOT NULL DEFAULT 'SRD (Sem Raça Definida)',
    context cat_context_enum NOT NULL DEFAULT 'stray',
    color VARCHAR(30) NOT NULL DEFAULT '#F39C12',
    temperament cat_temperament_enum NOT NULL DEFAULT 'friendly',
    approx_age cat_approx_age_enum NOT NULL DEFAULT 'adult',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_obfuscated BOOLEAN NOT NULL DEFAULT false,
    location_geom GEOGRAPHY(Point, 4326),
    local_photo_uri TEXT,
    remote_photo_url TEXT,
    notes TEXT,
    is_synced BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Função e Trigger para Sincronizar location_geom automaticamente
CREATE OR REPLACE FUNCTION public.sync_cat_location_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location_geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cat_location_geom ON public.cats;
CREATE TRIGGER trigger_update_cat_location_geom
BEFORE INSERT OR UPDATE ON public.cats
FOR EACH ROW EXECUTE FUNCTION public.sync_cat_location_geom();

-- 5. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_cats_geom ON public.cats USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_cats_updated_at ON public.cats (updated_at);
CREATE INDEX IF NOT EXISTS idx_cats_user_id ON public.cats (user_id);

-- 6. RPC para Consulta Geoespacial de Proximidade (Raio em Metros)
CREATE OR REPLACE FUNCTION public.get_cats_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
)
RETURNS SETOF public.cats AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.cats
    WHERE ST_DWithin(
        location_geom,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY ST_Distance(
        location_geom,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
    ) ASC;
END;
$$ LANGUAGE plpgsql STABLE;
