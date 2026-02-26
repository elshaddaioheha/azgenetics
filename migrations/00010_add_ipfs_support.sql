-- Migration to add IPFS support and transition from Supabase Storage
ALTER TABLE files ADD COLUMN IF NOT EXISTS ipfs_cid TEXT;
ALTER TABLE files ALTER COLUMN storage_path DROP NOT NULL;

-- Add index for CID lookups
CREATE INDEX IF NOT EXISTS idx_files_ipfs_cid ON files(ipfs_cid);
