# Rounds of administrative feedback for a Data Management Plans (DMPs)
CREATE TABLE `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `planId` INT NOT NULL,
  `requestedById` INT NOT NULL,
  `requested` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedById` INT,
  `completed` TIMESTAMP,
  `summaryText` TEXT,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (requestedById) REFERENCES users(id),
  FOREIGN KEY (completedById) REFERENCES users(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

# Feedback Comments
CREATE TABLE `feedbackComments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `feedbackId` INT NOT NULL,
  `answerId` INT NOT NULL,
  `commentText` TEXT NOT NULL,
  `createdById` INT NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedById` INT NOT NULL,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feedbackId) REFERENCES feedback(id) ON DELETE CASCADE,
  FOREIGN KEY (answerId) REFERENCES answers(id) ON DELETE CASCADE,
  INDEX feedback_comments_modified_idx (`answerId`, `modified`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
