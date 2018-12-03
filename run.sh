mkdir logs
docker run --name url2pdf_dumb-init --rm --net=host -v /usr/local/chrome-linux:/usr/local/chrome -v `pwd`/logs:/root/logs yale8848/url-to-pdf-api-docker:dumb-init