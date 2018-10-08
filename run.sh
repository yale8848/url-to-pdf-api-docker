mkdir logs
docker run --name url2pdf -d --restart=always -p 9000:9000 -v /usr/local/chrome-linux:/usr/local/chrome -v `pwd`/logs:/root/logs yale8848/url-to-pdf-api