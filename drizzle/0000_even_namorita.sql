CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cartItems` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`addedAt` integer DEFAULT '"2025-07-30T21:48:29.064Z"',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`price` real NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`buyerId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total` real NOT NULL,
	`createdAt` integer DEFAULT '"2025-07-30T21:48:29.064Z"',
	`updatedAt` integer DEFAULT '"2025-07-30T21:48:29.064Z"',
	FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`color` text,
	`storage` text,
	`condition` text NOT NULL,
	`images` text DEFAULT '[]',
	`stock` integer DEFAULT 1 NOT NULL,
	`sellerId` text NOT NULL,
	`isActive` integer DEFAULT true,
	`createdAt` integer DEFAULT '"2025-07-30T21:48:29.063Z"',
	`updatedAt` integer DEFAULT '"2025-07-30T21:48:29.063Z"',
	FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_sessionToken_unique` ON `sessions` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`role` text DEFAULT 'buyer' NOT NULL,
	`image` text,
	`emailVerified` integer DEFAULT false,
	`createdAt` integer DEFAULT '"2025-07-30T21:48:29.062Z"',
	`updatedAt` integer DEFAULT '"2025-07-30T21:48:29.062Z"'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
