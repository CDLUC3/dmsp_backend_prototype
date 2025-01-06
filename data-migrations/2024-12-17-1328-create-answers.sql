# Answers to questions on a Data Management Plans (DMPs)
CREATE TABLE `answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `versionedSectionId` INT NOT NULL,
  `versionedQuestionId` INT NOT NULL,
  `answerText` TEXT,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (versionedSectionId) REFERENCES versionedSections(id),
  FOREIGN KEY (versionedQuestionId) REFERENCES versionedQuestions(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Comments made on a speicifc answer
CREATE TABLE `answerComments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `answerId` INT NOT NULL,
  `commentText` TEXT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (answerId) REFERENCES answers(id) ON DELETE CASCADE,
  INDEX answer_comments_modified_idx (`answerId`, `modified`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
