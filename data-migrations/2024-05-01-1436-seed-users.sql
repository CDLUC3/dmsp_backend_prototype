
INSERT INTO `users`
  (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`)
VALUES
  ('orgA.user@example.com', 'https://ror.org/01nrxwf90', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Harry', 'Potter', 'RESEARCHER'),
  ('orgB.user@example.com', 'https://ror.org/01tm6cn81', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Lucious', 'Malfoy', 'RESEARCHER'),
  ('orgA.admin@example.com', 'https://ror.org/01nrxwf90', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Alastor', 'Moody', 'ADMIN'),
  ('orgB.admin@example.com', 'https://ror.org/01tm6cn81', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Minerva', 'McGonagall', 'ADMIN'),
  ('funder.admin@example.com', 'https://ror.org/01cwqze88', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Severus', 'Snape', 'ADMIN'),
  ('super@example.com', 'https://ror.org/00dmfq477', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Albus', 'Dumbledore', 'SUPERADMIN');
