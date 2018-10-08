# [url-to-pdf-api](https://github.com/alvarcarto/url-to-pdf-api) docker build

## version

- url-to-pdf-api: https://github.com/yale8848/url-to-pdf-api 
- puppeteer: 1.6.0
- chromium_revision: 571375

## docker use

  - download chrome binary: https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/571375/chrome-linux.zip
  - docker pull yale8848/url-to-pdf-api
  - mkdir logs && docker run --name url2pdf -d --restart=always -p 9000:9000 -v /usr/local/chrome-linux:/usr/local/chrome -v `pwd`/logs:/root/logs yale8848/url-to-pdf-api
  

## docker build

- docker build -t url2pdf .
  
## addition

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