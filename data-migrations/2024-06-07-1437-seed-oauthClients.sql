INSERT INTO oauthClients
  (name, redirectUris, grants, clientId, clientSecret, userId)
(SELECT
  'tester', 'http://localhost:3000/auth/callback', 'client_credentials, authorization_code',
  '1234567890', UUID(), `users`.`id`
FROM users
WHERE users.email = 'orgA.admin@example.com');
