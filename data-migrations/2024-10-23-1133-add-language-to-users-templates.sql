# Add the missing languageId column to the users and templates tables
ALTER TABLE `users`
  ADD`languageId` CHAR(5) NOT NULL DEFAULT 'en-US';

ALTER TABLE `templates`
  ADD`languageId` CHAR(5) NOT NULL DEFAULT 'en-US';

# Update all of the Brazilian templates to use pt-BR
UPDATE `templates` SET `languageId` = 'pt-BR' WHERE `ownerId` IN (
  'https://ror.org/01xdw4k60',
  'https://ror.org/04wffgt70',
  'https://ror.org/036rp1748',
  'https://ror.org/028kg9j04',
  'https://ror.org/03srtnf24'
);

# Update the admin users for the Brazilian institutions to use pt-BR
UPDATE `users` SET `languageId` = 'pt-BR' WHERE `affiliationId` IN (
  'https://ror.org/01xdw4k60',
  'https://ror.org/04wffgt70',
  'https://ror.org/036rp1748',
  'https://ror.org/028kg9j04',
  'https://ror.org/03srtnf24'
);
