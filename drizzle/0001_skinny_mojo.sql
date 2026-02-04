CREATE TABLE `installedSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instanceId` int NOT NULL,
	`skillId` int NOT NULL,
	`status` enum('installing','installed','failed','uninstalling') NOT NULL DEFAULT 'installing',
	`config` json,
	`installPath` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installedSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('running','stopped','error') NOT NULL DEFAULT 'stopped',
	`config` json,
	`port` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pluginConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instanceId` int NOT NULL,
	`pluginId` int NOT NULL,
	`config` json,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pluginConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`type` enum('channel','deployment','monitoring','skill-provider','other') NOT NULL,
	`version` varchar(50) NOT NULL,
	`description` text,
	`author` varchar(255),
	`configSchema` json,
	`enabled` boolean NOT NULL DEFAULT false,
	`installed` boolean NOT NULL DEFAULT false,
	`installPath` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plugins_id` PRIMARY KEY(`id`),
	CONSTRAINT `plugins_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `skillCollections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`skillIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skillCollections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`author` varchar(255),
	`sourceUrl` text,
	`provider` varchar(100) NOT NULL,
	`downloadCount` int DEFAULT 0,
	`rating` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
