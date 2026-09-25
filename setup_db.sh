#!/bin/bash
service mysql start
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS mecommerce;
CREATE USER IF NOT EXISTS 'mecommerce_user'@'%' IDENTIFIED BY 'mecommerce_password';
ALTER USER 'mecommerce_user'@'%' IDENTIFIED BY 'mecommerce_password';
GRANT ALL PRIVILEGES ON mecommerce.* TO 'mecommerce_user'@'%';
CREATE USER IF NOT EXISTS 'mecommerce_user'@'localhost' IDENTIFIED BY 'mecommerce_password';
ALTER USER 'mecommerce_user'@'localhost' IDENTIFIED BY 'mecommerce_password';
GRANT ALL PRIVILEGES ON mecommerce.* TO 'mecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "MySQL user and database successfully updated!"
