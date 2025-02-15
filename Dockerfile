FROM alpine:latest

RUN apk update && apk add --no-cache bash curl

CMD ["/bin/bash"]

