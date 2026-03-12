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
    `original_price` INTEGER NOT NULL,
    `status` ENUM('IN_STOCK', 'EXPIRED', 'LESS') NOT NULL DEFAULT 'IN_STOCK',
    `expired_time` VARCHAR(20) NOT NULL,
    `category_id` VARCHAR(20) NOT NULL,

    INDEX `IDX_PRODUCT_ID_NAME`(`product_id`, `name`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingredient` (
    `ingredient_id` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `avatar` TEXT NOT NULL,
    `unit` ENUM('KG', 'GRAM', 'CAN') NOT NULL,
    `count` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `expired_time` VARCHAR(20) NOT NULL,
    `status` ENUM('IN_STOCK', 'EXPIRED', 'LESS') NOT NULL DEFAULT 'IN_STOCK',

    INDEX `ingredient_ingredient_id_name_idx`(`ingredient_id`, `name`),
    PRIMARY KEY (`ingredient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_ingredient` (
    `product_id` VARCHAR(20) NOT NULL,
    `ingredient_id` VARCHAR(20) NOT NULL,
    `unit` ENUM('KG', 'GRAM', 'CAN') NOT NULL,
    `count` INTEGER NOT NULL,

    INDEX `FK_PRODUCT_INGREDIENT`(`product_id`),
    PRIMARY KEY (`product_id`, `ingredient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` VARCHAR(20) NOT NULL,
    `first_name` VARCHAR(200) NOT NULL,
    `last_name` VARCHAR(20) NOT NULL,
    `avatar` TEXT NULL,
    `password` VARCHAR(100) NOT NULL,
    `sex` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `power` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `phone` VARCHAR(11) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `reset_password_token` TEXT NULL,

    UNIQUE INDEX `user_password_key`(`password`),
    UNIQUE INDEX `user_phone_key`(`phone`),
    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_user_id_last_name_email_idx`(`user_id`, `last_name`, `email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill` (
    `bill_id` VARCHAR(20) NOT NULL,
    `user_id` VARCHAR(20) NOT NULL,
    `capital` INTEGER NOT NULL,
    `complete_total` INTEGER NOT NULL,
    `created_at` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`bill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill_detail` (
    `bill_id` VARCHAR(20) NOT NULL,
    `product_id` VARCHAR(20) NOT NULL,
    `count` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,

    INDEX `FK_BILL`(`bill_id`),
    PRIMARY KEY (`bill_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `FK_CATEGORY` FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_ingredient` ADD CONSTRAINT `FK_INGREDIENT` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`ingredient_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_ingredient` ADD CONSTRAINT `FK_PRODUCT_INGREDIENT` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bill` ADD CONSTRAINT `FK_BILL_USER` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bill_detail` ADD CONSTRAINT `FK_BILL` FOREIGN KEY (`bill_id`) REFERENCES `bill`(`bill_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bill_detail` ADD CONSTRAINT `FK_PRODUCT_BILL` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
