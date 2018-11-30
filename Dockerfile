FROM yale8848/centos7-node8

RUN yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y && \
    yum install ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y

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