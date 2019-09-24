import fs from 'fs';
import path from 'path';



function Clear() {


}
Clear.prototype.StartClearFontCache = function(folder, timeGapSeconds, fileExpSeconds) {

    if (this.fontCacheInterval) {
        clearInterval(this.fontCacheInterval);
    }
    this.fontCacheInterval = setInterval(function() {

        fs.readdir(folder, function(err, files) {
            if (err) {
                console.log(err);
            } else {
                files.forEach(function(filename) {
                    const filedir = path.join(folder, filename)
                    fs.stat(filedir, function(eror, stats) {
                        if (eror) {
                            console.log(eror);
                        } else {
                            const isFile = stats.isFile();
                            if (isFile && (new Date().getTime()) - stats.mtime.getTime() > fileExpSeconds * 1000) {
                                fs.unlink(filedir, (e) => {
                                    if (e) console.log(e);
                                });
                            }
                        }
                    });
                });
            }
        });

    }, timeGapSeconds);

};

module.exports = Clear