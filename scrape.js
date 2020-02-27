const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const inquirer = require('inquirer');
const writeStream = fs.createWriteStream('index.html', { flags: 'a' });

const questions = [{
	type: 'input',
	name: 'name',
	message: "What's the url?",
}]

let url = '';


inquirer.prompt(questions).then(answers => {
	url = answers['name'];

	fs.truncate('./index.html', 0, () => {
		console.log('...working')
	})

	const options = {
		url: url
	};

	request(options, (error, response, html) => {
		if (!error && response.statusCode === 200) {
			const $ = cheerio.load(html);

			const styleTag = $('style[type="text/css"]');
			const linkStyle = $('link[rel=stylesheet]');
			const article = $('article');
			let styles = '';
			let headerLinks = '';

			styleTag.each((__, elm) => {
				styles += $(elm).html();
			})

			linkStyle.each((__, elm) => {
				headerLinks += `<link rel="stylesheet" type="text/css" href="${$(elm).attr('href')}">`;
			})

			writeStream.write(`
				<head>
					${headerLinks}
					<style>${styles}</style>
					<meta data-rh="true" name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
					<style>body{ background-color: white}</style>
				</head>
					
				${article.html()}
					
				${/* build images */''}
				<script>
				document.querySelectorAll('noscript').forEach((x, i) => {
					x.insertAdjacentHTML('afterend',  x.innerHTML)
				})
				</script>`
			)
		}

	})
}) 