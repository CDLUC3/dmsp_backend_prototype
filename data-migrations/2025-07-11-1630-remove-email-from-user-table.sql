-- Migration script remove email from the users table.  It should come from
-- the userEmails table instead in the code.

-- migrates existing emails already in the users table to userEmails if it doesn't
-- already exist there and if the email is not null or empty.

INSERT INTO userEmails (
  userId,
  email,
  isPrimary,
  isConfirmed,
  createdById,
  created,
  modifiedById,
  modified
)
SELECT
  u.id AS userId,
  u.email,
  1 AS isPrimary,
  1 AS isConfirmed,
  u.id AS createdById,
  NOW() AS created,
  u.id AS modifiedById,
  NOW() AS modified
FROM
  users u
    LEFT JOIN
  userEmails ue
  ON ue.userId = u.id AND ue.email = u.email
WHERE
  u.email IS NOT NULL
  AND TRIM(u.email) != ''
  AND ue.id IS NULL;

-- Now that the emails have been migrated, we can safely remove the email column
ALTER TABLE `users`
  DROP COLUMN `email`;
