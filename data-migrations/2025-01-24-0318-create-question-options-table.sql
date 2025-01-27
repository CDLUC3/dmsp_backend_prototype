CREATE TABLE `questionOptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `questionId` INT NOT NULL,
  `text` VARCHAR(255) NOT NULL,
  `orderNumber` INT NOT NULL,
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` int,
  FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
  CONSTRAINT unique_question_option UNIQUE (`questionId`, `text`),
  CONSTRAINT unique_question_option UNIQUE (`questionId`, `orderNumber`)`
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
