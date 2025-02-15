# FROM php:8.2-apache
# EXPOSE 8080
#
#
# FROM alpine:latest
# RUN apk update && apk add --no-cache bash curl
# CMD ["/bin/bash"]

FROM alpine:latest

# Install PHP, FPM, and required extensions
RUN apk add --no-cache \
    php \
    php-fpm \
    php-cli \
    php-mysqli \
    php-json \
    php-opcache \
    php-mbstring \
    php-xml \
    php-session \
    php-tokenizer

# Create a PHP-FPM configuration (optional)
RUN mkdir -p /run/php

# Set working directory
WORKDIR /var/www/html
COPY ./src .
# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm", "-F"]
