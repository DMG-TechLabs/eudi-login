FROM php:8.2-apache
EXPOSE 8080


FROM alpine:latest
RUN apk update && apk add --no-cache bash curl
CMD ["/bin/bash"]

