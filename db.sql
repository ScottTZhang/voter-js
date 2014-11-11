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


INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (1, 'study', 'let\'s study', 1);
INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (2, 'work', 'keep working', 1);
INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (3, 'car', 'top gear', 1);
INSERT INTO `Section` (`id`, `name`, `description`, `status`) VALUES (4, 'women', 'ask women', 1);

INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (1, 'how many FWB do you have?', 'as you see', 1, 'admin', 4);
INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (2, 'what is your car?', 'as you see', 1, 'admin', 3);
INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (3, 'how much do you make?', 'as you see', 1, 'admin', 2);
INSERT INTO `Survey` (`id`, `title`, `description`, `status`, `holder`, `sectionId`) VALUES (4, 'what college are you from?', 'as you see', 1, 'admin', 1);
INSERT INTO `Survey` (`title`, `description`, `status`, `holder`, `sectionId`) VALUES ('what is your major?', 'for living, not for fun!', 1, 'admin', 1);

INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (1,'how old are you?!', 1, 1);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (2,'which country?!', 1, 4);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (3,'which state/province?!', 1, 4);
INSERT INTO `Question` (`id`, `question`, `status`, `surveyId`) VALUES (4,'what is school name?', 1, 4);
INSERT INTO `Question` (`question`, `status`, `surveyId`) VALUES ('what is your job?', 1, 2);

INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('11-20', 1, 1);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('21-30', 1, 1);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('United States', 1, 2);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('China', 1, 2);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('India', 1, 2);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('IL', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('CA', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Guangxi', 1, 3);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('NU', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('NYU', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('UW', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('山东蓝翔', 1, 4);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Student', 1, 5);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Software Development Vase', 1, 5);
INSERT INTO `Item` (`item`, `status`, `questionId`) VALUES ('Software Development Dog', 1, 5);
