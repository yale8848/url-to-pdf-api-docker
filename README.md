# [url-to-pdf-api](https://github.com/alvarcarto/url-to-pdf-api) docker build

## version

- url-to-pdf-api: https://github.com/yale8848/url-to-pdf-api 
- puppeteer: 1.6.0

## docker run
 
  - docker pull yale8848/url-to-pdf-api-docker:latest
  - mkdir logs && docker run --name url2pdf -d --restart=always -p 9000:9000 -v `pwd`/logs:/root/logs yale8848/url-to-pdf-api-docker:latest
  
## docker build

- docker build -t url2pdf .
  
## addition

- docker container localtime is set to 'Asia/Shanghai'
- and some chinese fonts in container
- modify  url-to-pdf-api code
  - if page use Mathjax, render page after Mathjax render finish
  - add parse pdf header and footer temp in page (pdf.displayHeaderFooter=true and pdf.margin.*=1cm)

    ```
    <pdf-render-header style="display:none">
        <div><img src="base64" /></div>
    </pdf-render-header>

    <pdf-render-footer style="display:none">
        <style type="text/css"> 
            .footer { 
                font-size: 10px;
                position: relative;
                width: 100%;
                text-align: center;
                top: 5px;
            }
        </style>
        <div class="footer">
            <span class="pageNumber"></span>/<span class="totalPages"></span>
        </div>
    </pdf-render-footer>
    ``` 

## tips

- use dumb-init to start docker container to avoid zombie chrome process (https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker)