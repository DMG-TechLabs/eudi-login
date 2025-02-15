FROM alpine:3.21
LABEL maintainer="erik.soderblom@gmail.com"
LABEL description="Alpine based image with apache2 and php8."

# Setup apache and php
RUN apk --no-cache --update \
    add apache2 \
    apache2-ssl \
    curl \
    php84-apache2 \
    php84-bcmath \
    php84-bz2 \
    php84-calendar \
    php84-common \
    php84-ctype \
    php84-curl \
    php84-dom \
    php84-gd \
    php84-iconv \
    php84-mbstring \
    php84-mysqli \
    php84-mysqlnd \
    php84-openssl \
    php84-pdo_mysql \
    php84-pdo_pgsql \
    php84-pdo_sqlite \
    php84-phar \
    php84-session \
    php84-xml \
    && mkdir /htdocs

# COPY ./src /htdocs
EXPOSE 80 443

COPY docker-entrypoint.sh /

HEALTHCHECK CMD wget -q --no-cache --spider localhost

ENTRYPOINT ["/docker-entrypoint.sh"]

# # FROM php:8.2-apache
# # EXPOSE 8080
# #
# #
# # FROM alpine:latest
# # RUN apk update && apk add --no-cache bash curl
# # CMD ["/bin/bash"]
#
# FROM alpine:latest
#
# # Install PHP, FPM, and required extensions
# RUN apk update && apk upgrade
# RUN export phpverx=$(alpinever=$(cat /etc/alpine-release|cut -d '.' -f1);[ $alpinever -ge 9 ] && echo  7|| echo 5)
# RUN apk add apache2 php$phpverx-apache2
# # RUN 
# #
# #
# #
# # RUN apk add --no-cache \
# #     php \
# #     php-fpm \
# #     php-cli \
# #     php-mysqli \
# #     php-json \
# #     php-opcache \
# #     php-mbstring \
# #     php-xml \
# #     php-session \
# #     php-tokenizer
#
# # Create a PHP-FPM configuration (optional)
# # RUN mkdir -p /run/php
#
# # Set working directory
# # WORKDIR /var/www/html
# COPY ./src /var/www/localhost/htdocs
# # Expose PHP-FPM port
# EXPOSE 80
#
# # Start PHP-FPM
# # CMD ["php8-fpm", "-F"]
# CMD ["rc-service", "apache2", "start"]
