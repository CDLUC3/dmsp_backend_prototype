
# TODO: Switch this to a script so that it uses the appropriate SALT!

INSERT INTO `users`
  (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`)
VALUES
  ('orgA.user@example.com', 'https://ror.org/01nrxwf90', '$2a$10$HeRb8Z2NK86pjJp300/flOt.xKK2hSkT1eLydo0KKNX8xrpLr3S7u', 'Harry', 'Potter', 'Researcher'),
  ('orgB.user@example.com', 'https://ror.org/01tm6cn81', '$2a$10$HeRb8Z2NK86pjJp300/flOt.xKK2hSkT1eLydo0KKNX8xrpLr3S7u', 'Lucious', 'Malfoy', 'Researcher'),
  ('orgA.admin@example.com', 'https://ror.org/01nrxwf90', '$2a$10$HeRb8Z2NK86pjJp300/flOt.xKK2hSkT1eLydo0KKNX8xrpLr3S7u', 'Alastor', 'Moody', 'Admin'),
  ('orgB.admin@example.com', 'https://ror.org/01tm6cn81', '$2a$10$HeRb8Z2NK86pjJp300/flOt.xKK2hSkT1eLydo0KKNX8xrpLr3S7u', 'Minerva', 'McGonagall', 'Admin'),
  ('funder.admin@example.com', 'https://ror.org/01cwqze88', '$2a$10$HeRb8Z2NK86pjJp300/flOt.xKK2hSkT1eLydo0KKNX8xrpLr3S7u', 'Severus', 'Snape', 'Admin'),
  ('super@example.com', 'https://ror.org/00dmfq477', '$2a$10$HeRb8Z2NK86pjJp300/flOt.xKK2hSkT1eLydo0KKNX8xrpLr3S7u', 'Albus', 'Dumbledore', 'SuperAdmin');
