-- CreateTable
CREATE TABLE `category` (
    `category_id` VARCHAR(20) NOT NULL,
    `avatar` TEXT NOT NULL,
    `name` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `product_id` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `avatar` TEXT NOT NULL,
    `count` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `status` ENUM('IN_STOCK', 'EXPIRED', 'LESS') NOT NULL DEFAULT 'IN_STOCK',
    `expired_time` VARCHAR(20) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `FK_CATEGORY` FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
