FROM centos/nodejs-8-centos7

RUN sudo yum -y update && sudo yum -y install unzip xfonts-utils wget gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils mkfontscale mkfontdir fc-cache

RUN mkdir /root/url-to-pdf-api
COPY url-to-pdf-api /root/url-to-pdf-api    
WORKDIR /root/url-to-pdf-api

ENV DEBUG_MODE=false \
    ALLOW_HTTP=true \
    HOST=0.0.0.0 \ 
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/local/chrome/chrome \
    LOG_PATH=/root/logs

RUN npm install --registry=http://registry.npm.taobao.org

COPY fonts /usr/share/fonts/win

RUN chmod 644 /usr/share/fonts/win/* && mkfontscale && mkfontdir && fc-cache -fv && \
    /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' > /etc/timezone

WORKDIR /root/url-to-pdf-api

EXPOSE 9000

CMD [ "npm", "start"]