CREATE TABLE IF NOT EXISTS pulse_consumers (
  consumer_address varchar(42) PRIMARY KEY,
  config_data jsonb NOT NULL,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
