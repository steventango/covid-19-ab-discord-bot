const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;


let	text = "";
let html ="";
let	last_updated = 0;

async function getText() {
	if (text.length === 0 || Date.now() - last_updated > 60000) {
		const data = await fetch("https://cors-anywhere.herokuapp.com/https://covid19stats.alberta.ca/", {headers: {origin: "covid19stats.alberta.ca"}});
		if (data.status === 200) {
			text = await data.text();
			last_updated = Date.now();
		} else {
			throw "Network Error: " + data.status;
		}
	}
	return text;
}

async function getHTML() {
	if (html.length === 0 || Date.now() - last_updated > 60000) {
		html = document.createElement('html');
		html.innerHTML = await getText();
	}
	return html;
}

async function characteristics() {
	const html = await getHTML();
	const node = html.querySelector('#characteristics table');

	return node.textContent;
}

getHTML();

module.exports.characteristics = characteristics;