# Remove the foreign key relationships the `users` table has on itself
ALTER TABLE users DROP FOREIGN KEY users_ibfk_1;
ALTER TABLE users DROP FOREIGN KEY users_ibfk_2;
