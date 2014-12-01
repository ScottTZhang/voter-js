DROP DATABASE IF EXISTS `voter`;
CREATE database voter character set utf8;

use voter;

DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `status` tinyint,
  `createTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `modifiedTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `Section`;
CREATE TABLE `Section` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  `description` varchar(600) NOT NULL,
  `status` tinyint,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `Survey`;
CREATE TABLE `Survey` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(140) NOT NULL,
  `description` varchar(1024) NOT NULL,
  `status` tinyint DEFAULT 1,
  `holder` varchar(100) NOT NULL,
  `sectionId` int,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `Question`;
CREATE TABLE `Question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(1024) NOT NULL,
  `status` tinyint DEFAULT 1,
  `surveyId` int,
  `createTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `modifiedTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `Item`;
CREATE TABLE `Item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item` varchar(888) NOT NULL,
  `status` tinyint DEFAULT 1,
  `questionId` int,
  `count` int DEFAULT 0,
  `createTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `modifiedTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  FOREIGN KEY(`questionId`) REFERENCES `Question`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (1, 'Study', 'Don\'t play around. Go study!', 1);
INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (2, 'Work', 'For the money. For the party', 1);
INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (3, 'Car', 'Let the engine roar!', 1);
INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (4, 'Travelling', 'Which one is on the way? Your mind or body?', 1);

INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (1, 'Are you from the Ivy League?', 'Including A, B, C, D, E, F, G, H, I, K.', 1, 'admin', 1);
INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (2, 'How much do you make?', 'As the title', 1, 'admin', 2);
INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (3, 'What is your car?', 'As the title', 1, 'admin', 3);
INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (4, 'Have you been to Thailand?', 'As the title.', 1, 'admin', 4);

INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (1,'Is one of them?', 1, 1);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (2,'Which state/province?!', 1, 1);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (3,'What is school name?', 1, 1);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (4,'Give me a number.', 1, 2);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (5,'Tell me the brand.', 1, 3);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (6,'Did you go to Thailand?', 1, 4);

INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Yes. I am proud.', 1, 1);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('No. Not that nerdy and geeky and smart.', 1, 1);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('IL', 1, 2);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('CA', 1, 2);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('NY', 1, 2);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('NU', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('NYU', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('UW', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('山东蓝翔', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('So much.', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('So poor.', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('It\'s a secret, dude!', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Chevy', 1, 5);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Audi', 1, 5);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Honda', 1, 5);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('BMW', 1, 5);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Yes.', 1, 6);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('No.', 1, 6);
