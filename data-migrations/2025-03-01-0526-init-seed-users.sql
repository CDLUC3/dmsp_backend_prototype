# Seed some institutional admin users
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@cdlib.org', 'https://ror.org/03yrm5c26', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'CDL', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@ucdavis.edu', 'https://ror.org/05rrcem69', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'UCD', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@usc.edu', 'https://ror.org/03taz7m60', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'USC', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@stanford.edu', 'https://ror.org/00f54p054', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Stanford', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`, `languageId`) VALUES ('admin@www5.usp.br', 'https://ror.org/036rp1748', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Universidade de São Paulo', 'Admin', 'ADMIN', 'pt-BR');

# Seed some institutional researcher users
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('researcher@ucdavis.edu', 'https://ror.org/05rrcem69', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'UCD', 'Researcher', 'RESEARCHER');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('researcher@usc.edu', 'https://ror.org/03taz7m60', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'USC', 'Researcher', 'RESEARCHER');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('researcher@stanford.edu', 'https://ror.org/00f54p054', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Stanford', 'Researcher', 'RESEARCHER');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`, `languageId`) VALUES ('researcher@www5.usp.br', 'https://ror.org/036rp1748', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Universidade de São Paulo', 'Researcher', 'RESEARCHER', 'pt-BR');

# Seed some fundings agency admin users
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@energy.gov', 'https://ror.org/01bj3aw27', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'DOE', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@moore.org', 'https://ror.org/006wxqw41', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'Moore Foundation', 'Adminr', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@nasa.gov', 'https://ror.org/027ka1x80', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'NASA', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@nih.gov', 'https://ror.org/01cwqze88', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'NIH', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@nsf.gov', 'https://ror.org/021nxhr62', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'NSF', 'Admin', 'ADMIN');
INSERT INTO `users` (`email`, `affiliationId`, `password`, `givenName`, `surName`, `role`) VALUES ('admin@usgs.gov', 'https://ror.org/035a68863', '$2a$10$f3wCBdUVt/2aMcPOb.GX1OBO9WMGxDXx5HKeSBBnrMhat4.pis4Pe', 'USGS', 'Admin', 'ADMIN');
