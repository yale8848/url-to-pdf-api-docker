# [url-to-pdf-api](https://github.com/alvarcarto/url-to-pdf-api) docker build

## build new 

   ```
    
    FROM yale8848/url-to-pdf-api-docker:libs

    COPY url-to-pdf-api /root/url-to-pdf-api 

    ENV DEBUG_MODE=false \
    ALLOW_HTTP=true \
    HOST=0.0.0.0 \ 
    ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    LOG_PATH=/root/logs

    
    WORKDIR /root/url-to-pdf-api

    RUN npm install --registry=http://registry.npm.taobao.org

    EXPOSE 9000

    CMD [ "npm", "start"]


   ```


