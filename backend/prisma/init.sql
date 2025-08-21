-- Initialize ArogyaMitra database
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE arogyamitra'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'arogyamitra')\gexec

-- Connect to the database
\c arogyamitra;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just placeholders for future optimization