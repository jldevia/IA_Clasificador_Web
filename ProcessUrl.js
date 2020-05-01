'use strict'

var Crawler = require('crawler');

var proc = function process(url, done) {
    let crawler = new Crawler();

    crawler.direct({
        uri: url,
        skipEventRequest: false,
        callback: function (error, res) {
            if (error) {
                done(err);
            } else {
                let $ = res.$;
                done(null, {
                    url: url,
                    title: $('title').text(),
                    keywords: $("meta[name*='keywords']").attr("content"),
                    description: $("meta[name='description']").attr("content")
                })

            }

        }
    });

}


module.exports = proc;