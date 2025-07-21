# Remove the foreign key restraints from affiliations because it makes it
# impossible to delete the Affiliation and Users tables!

# Remove the affiliation --> user relations
ALTER TABLE affiliations DROP FOREIGN KEY affiliations_ibfk_1;
ALTER TABLE affiliations DROP FOREIGN KEY affiliations_ibfk_2;

# Remove the user --> affiliation relation
ALTER TABLE users DROP FOREIGN KEY users_ibfk_3;
