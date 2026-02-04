ALTER TABLE `instances` ADD `llmProvider` varchar(50);--> statement-breakpoint
ALTER TABLE `instances` ADD `llmApiKey` text;--> statement-breakpoint
ALTER TABLE `instances` ADD `llmModel` varchar(100);--> statement-breakpoint
ALTER TABLE `skills` ADD `usageCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `skills` ADD `lastUsedAt` timestamp;--> statement-breakpoint
ALTER TABLE `skills` ADD `tags` json;