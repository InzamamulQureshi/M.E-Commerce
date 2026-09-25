#!/bin/bash
service mysql start
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS thefourfold;
CREATE USER IF NOT EXISTS 'fourfold_user'@'%' IDENTIFIED BY 'fourfold_password';
ALTER USER 'fourfold_user'@'%' IDENTIFIED BY 'fourfold_password';
GRANT ALL PRIVILEGES ON thefourfold.* TO 'fourfold_user'@'%';
CREATE USER IF NOT EXISTS 'fourfold_user'@'localhost' IDENTIFIED BY 'fourfold_password';
ALTER USER 'fourfold_user'@'localhost' IDENTIFIED BY 'fourfold_password';
GRANT ALL PRIVILEGES ON thefourfold.* TO 'fourfold_user'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "MySQL user and database successfully updated!"
