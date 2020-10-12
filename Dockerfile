FROM node:8-slim

RUN echo deb http://mirrors.163.com/debian/ jessie main non-free contrib >> /etc/apt/sources.list && \
    echo deb http://mirrors.163.com/debian/ jessie-updates main non-free contrib >> /etc/apt/sources.list && \
    echo deb http://mirrors.163.com/debian-archive/debian/ jessie-backports main non-free contrib >> /etc/apt/sources.list && \
    echo deb http://mirrors.163.com/debian-security/ jessie/updates main non-free contrib >> /etc/apt/sources.list && \
    apt-get -o Acquire::Check-Valid-Until=false update && apt-get install -yq unzip xfonts-utils && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && rm -r /var/lib/apt/lists/*


COPY fonts /usr/share/fonts/win
RUN chmod 644 /usr/share/fonts/win/* && mkfontscale && mkfontdir && fc-cache -fv && \
    /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' > /etc/timezone

ENV DEBUG_MODE=false \
    ALLOW_HTTP=true \
    HOST=0.0.0.0 \ 
    LOG_PATH=/root/logs

RUN mkdir /root/url-to-pdf-api
COPY url-to-pdf-api /root/url-to-pdf-api 
WORKDIR /root/url-to-pdf-api

RUN npm install

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

EXPOSE 9000

ENTRYPOINT ["dumb-init", "--"]
CMD [ "npm", "start"]