const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const writeStream = fs.createWriteStream('index.html', { flags: 'a' });

const url = ''

fs.truncate('./index.html', 0, function(){console.log('done')})

request(url, (error, response, html) => {
	if (!error && response.statusCode === 200) {
		const $ = cheerio.load(html);

		const styleTag = $('style');
		const article = $('article');
		let styles = '';

		styleTag.each((__, elm) => {
			styles += $(elm).html();
		})

		writeStream.write(
			`<style>${styles}</style>${article.html()}`
		)
	}

})