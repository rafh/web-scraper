const axios = require('axios');
const open = require('open');
const cheerio = require('cheerio');
const fs = require('fs');
const inquirer = require('inquirer');
const vomitEmoji = require('./vomit');
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

	axios
	.get(url)
	.then((response) => {
		console.log(response)
		if (response.status === 200) {
			const $ = cheerio.load(response.data);

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
		open('./index.html');
	})
	.catch((error) => {
		let errorMsg = 'Something went awry...';
		if (error.code === 'ENOTFOUND') {
			errorMsg = 'Not found...';
		}
		if(error.code === 'ECONNREFUSED') {
			errorMsg = 'Connection refused...';
		}
		if (error) {
			writeStream.write(`
			<style>
				div {
					display: flex;
					justify-content: center;
					flex-direction: column;
					align-items: center;
					height: 100%;					
				}
				svg {
					max-width: 500px;
					width: 90%;
				}
				h1 {
					font-family: Arial;
					font-size: 4rem;
				}
			</style>
			<div>
				${vomitEmoji}
				<h1>${errorMsg}</h1>
			</div>`
			)
		}
	});
}) 