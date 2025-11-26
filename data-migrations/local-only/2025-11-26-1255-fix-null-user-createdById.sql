
UPDATE users SET createdById = id, modifiedById = id WHERE createdById IS NULL;
