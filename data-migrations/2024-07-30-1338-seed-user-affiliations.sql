UPDATE users SET affiliationId = 'https://ror.org/01nrxwf90' WHERE email LIKE '%A.%';
UPDATE users SET affiliationId = 'https://ror.org/01tm6cn81' WHERE email LIKE '%B.%';
UPDATE users SET affiliationId = 'https://ror.org/01cwqze88' WHERE email LIKE '%funder.%';
UPDATE users SET affiliationId = 'https://ror.org/00dmfq477' WHERE affiliationId IS NULL;
