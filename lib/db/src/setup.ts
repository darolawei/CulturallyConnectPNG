import { pool } from "./index";

const statements = [
  `DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('contributor', 'reviewer', 'admin');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE moderation_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE rights_status AS ENUM ('public_domain', 'open_license', 'permission_required', 'community_owned', 'unknown');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE cultural_sensitivity AS ENUM ('public', 'community_review', 'restricted', 'sacred');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    email text NOT NULL UNIQUE,
    display_name text NOT NULL,
    role user_role NOT NULL DEFAULT 'contributor',
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS provinces (
    id text PRIMARY KEY,
    name text NOT NULL,
    capital text NOT NULL,
    region text NOT NULL,
    population integer,
    area real,
    languages text[],
    flag_color text,
    description text,
    dance_style text,
    image_url text
  );`,
  `CREATE TABLE IF NOT EXISTS stories (
    id text PRIMARY KEY,
    province_id text NOT NULL REFERENCES provinces(id),
    title text NOT NULL,
    content text NOT NULL,
    elder_name text NOT NULL,
    recorded_at timestamp NOT NULL DEFAULT now(),
    audio_url text,
    language text,
    tags text[],
    source_title text,
    source_url text,
    source_author text,
    license text,
    rights_status rights_status NOT NULL DEFAULT 'unknown',
    cultural_sensitivity cultural_sensitivity NOT NULL DEFAULT 'community_review',
    import_batch_id text,
    status moderation_status NOT NULL DEFAULT 'pending',
    created_by text REFERENCES users(id),
    updated_by text REFERENCES users(id),
    approved_by text REFERENCES users(id),
    approved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS herbs (
    id text PRIMARY KEY,
    province_id text NOT NULL REFERENCES provinces(id),
    name text NOT NULL,
    local_name text NOT NULL,
    description text NOT NULL,
    uses text[] NOT NULL,
    preparation text,
    warnings text,
    image_url text,
    source_title text,
    source_url text,
    source_author text,
    license text,
    rights_status rights_status NOT NULL DEFAULT 'unknown',
    cultural_sensitivity cultural_sensitivity NOT NULL DEFAULT 'community_review',
    import_batch_id text,
    status moderation_status NOT NULL DEFAULT 'pending',
    created_by text REFERENCES users(id),
    updated_by text REFERENCES users(id),
    approved_by text REFERENCES users(id),
    approved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS villages (
    id text PRIMARY KEY,
    province_id text NOT NULL REFERENCES provinces(id),
    name text NOT NULL,
    clan_origin text NOT NULL,
    founding_story text NOT NULL,
    location text,
    population integer,
    languages text[],
    traditions text[],
    source_title text,
    source_url text,
    source_author text,
    license text,
    rights_status rights_status NOT NULL DEFAULT 'unknown',
    cultural_sensitivity cultural_sensitivity NOT NULL DEFAULT 'community_review',
    import_batch_id text,
    status moderation_status NOT NULL DEFAULT 'pending',
    created_by text REFERENCES users(id),
    updated_by text REFERENCES users(id),
    approved_by text REFERENCES users(id),
    approved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS songs (
    id text PRIMARY KEY,
    province_id text NOT NULL REFERENCES provinces(id),
    title text NOT NULL,
    description text NOT NULL,
    performer text,
    language text,
    audio_url text,
    lyrics text,
    tags text[],
    source_title text,
    source_url text,
    source_author text,
    license text,
    rights_status rights_status NOT NULL DEFAULT 'unknown',
    cultural_sensitivity cultural_sensitivity NOT NULL DEFAULT 'community_review',
    import_batch_id text,
    status moderation_status NOT NULL DEFAULT 'pending',
    created_by text REFERENCES users(id),
    updated_by text REFERENCES users(id),
    approved_by text REFERENCES users(id),
    approved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS festivals (
    id text PRIMARY KEY,
    province_id text NOT NULL REFERENCES provinces(id),
    name text NOT NULL,
    month text,
    description text NOT NULL,
    location text,
    tags text[],
    source_title text,
    source_url text,
    source_author text,
    license text,
    rights_status rights_status NOT NULL DEFAULT 'unknown',
    cultural_sensitivity cultural_sensitivity NOT NULL DEFAULT 'public',
    import_batch_id text,
    status moderation_status NOT NULL DEFAULT 'pending',
    created_by text REFERENCES users(id),
    updated_by text REFERENCES users(id),
    approved_by text REFERENCES users(id),
    approved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS conversations (
    id serial PRIMARY KEY,
    title text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS messages (
    id serial PRIMARY KEY,
    conversation_id integer NOT NULL REFERENCES conversations(id) ON DELETE cascade,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );`,
];

try {
  for (const statement of statements) {
    await pool.query(statement);
  }
  console.log("Database schema is ready.");
} finally {
  await pool.end();
}
