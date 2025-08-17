PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cartItems` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`addedAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_cartItems`("id", "userId", "productId", "quantity", "addedAt") SELECT "id", "userId", "productId", "quantity", "addedAt" FROM `cartItems`;--> statement-breakpoint
DROP TABLE `cartItems`;--> statement-breakpoint
ALTER TABLE `__new_cartItems` RENAME TO `cartItems`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`buyerId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paymentStatus` text DEFAULT 'pending' NOT NULL,
	`paymentMethod` text,
	`total` real NOT NULL,
	`createdAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"',
	`updatedAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"',
	FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "buyerId", "status", "paymentStatus", "paymentMethod", "total", "createdAt", "updatedAt") SELECT "id", "buyerId", "status", "paymentStatus", "paymentMethod", "total", "createdAt", "updatedAt" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`reference` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider` text NOT NULL,
	`providerReference` text,
	`ussdCode` text,
	`phoneNumber` text,
	`metadata` text,
	`createdAt` integer DEFAULT '"2025-08-16T18:12:33.196Z"',
	`updatedAt` integer DEFAULT '"2025-08-16T18:12:33.196Z"',
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_payments`("id", "orderId", "reference", "amount", "status", "provider", "providerReference", "ussdCode", "phoneNumber", "metadata", "createdAt", "updatedAt") SELECT "id", "orderId", "reference", "amount", "status", "provider", "providerReference", "ussdCode", "phoneNumber", "metadata", "createdAt", "updatedAt" FROM `payments`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
ALTER TABLE `__new_payments` RENAME TO `payments`;--> statement-breakpoint
CREATE UNIQUE INDEX `payments_reference_unique` ON `payments` (`reference`);--> statement-breakpoint
CREATE TABLE `__new_products` (
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
	`createdAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"',
	`updatedAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"',
	FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "description", "price", "brand", "model", "color", "storage", "condition", "images", "stock", "sellerId", "isActive", "createdAt", "updatedAt") SELECT "id", "name", "description", "price", "brand", "model", "color", "storage", "condition", "images", "stock", "sellerId", "isActive", "createdAt", "updatedAt" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`role` text DEFAULT 'buyer' NOT NULL,
	`image` text,
	`emailVerified` integer DEFAULT false,
	`createdAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"',
	`updatedAt` integer DEFAULT '"2025-08-16T18:12:33.195Z"'
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "password", "role", "image", "emailVerified", "createdAt", "updatedAt") SELECT "id", "name", "email", "password", "role", "image", "emailVerified", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);