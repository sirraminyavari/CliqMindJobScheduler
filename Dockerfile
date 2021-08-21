FROM redis:alpine

ARG BUILD_DATE
ARG VCS_REF

LABEL org.label-schema.build-date=$BUILD_DATE \
    org.label-schema.schema-version="1.0.0-rc1" \
    org.label-schema.vcs-ref=$VCS_REF \
    org.label-schema.version="latest"

COPY ./ /scheduler

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/v3.12/main" >> /etc/apk/repositories \
    && apk upgrade -U -a \
    && apk add \
    nodejs \
    npm \
    && npm install -g concurrently \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

RUN npm install

#RUN both redis and node app concurrently
CMD concurrently "redis-server --bind '0.0.0.0'" "sleep 5s; node /scheduler/app.js"