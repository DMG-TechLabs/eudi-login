# eudi-login
docker build -t alpine-apache-php:latest .
sudo docker run --detach \                                                                        ─╯
    --name alpine-apache-php \
    --publish 80:80 \
    --publish 443:443 \
    --restart unless-stopped \
    --volume /path/eudi-login/src:/htdocs \
    alpine-apache-php:latest
