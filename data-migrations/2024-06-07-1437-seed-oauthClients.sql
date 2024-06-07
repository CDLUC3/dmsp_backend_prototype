INSERT INTO `oauthClients`
  (`name`, `redirectUris`, `grants`, `clientId`, `clientSecret`, `userId`)
VALUES
  (SELECT
    'tester', 'http://localhost:3000/auth/callback', 'client_credentials, authorization_code',
    '1234567890', UUID(), `users`.`id`
  FROM `users`
  WHERE `email` = 'org.admin@example.com');
