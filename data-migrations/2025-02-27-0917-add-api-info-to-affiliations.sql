# Add the API Target location to the affiliations table
ALTER TABLE affiliations
  ADD COLUMN apiTarget VARCHAR(255) NULL;
