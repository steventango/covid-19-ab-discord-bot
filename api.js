const Discord = require('discord.js');
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

async function getData(text_type=false) {
	var data = await fetch("https://cors-anywhere.herokuapp.com/https://www.alberta.ca/covid-19-alberta-data.aspx", { headers: { origin: 'steventang.tk' } })
	if (data.status === 200) {
		var text = await data.text()
		var html = document.createElement('html');
		html.innerHTML = text;
		if (text_type) {
			return [text];
		} else {
			return html.querySelectorAll('table');
		}
	} else {
		return "Network Error: " + data.status;
	}
}

async function getLocationsData() {
	var data = await getData();
	if (typeof data !== "string") {
		var locationsData = data[0].children[2];
		var LocationsData = {};
		Array.from(locationsData.children).forEach(row => {
			LocationsData[row.children[0].textContent] = [Number.parseInt(row.children[1].textContent.replace(/,/g, '')), Number.parseInt(row.children[2].textContent.replace(/,/g, ''))];
		});
		return LocationsData;
	} else {
		return data;
	}
}

async function getLocationsEmbed() {
	var data = await getLocationsData();
	if (typeof data !== "string") {
		var LocationsEmbed = new Discord.MessageEmbed()
			.setColor('#00aad2')
			.setTitle('Cases in Alberta and Canada')
			.setURL('https://www.alberta.ca/covid-19-alberta-data.aspx')
			.setDescription('Aggregate data on COVID-19 cases in Alberta and Canada.');

		Object.keys(data).forEach(location => {
			LocationsEmbed.addFields(
				{ name: `**${location}**`, value: '\u200b', inline: true },
				{ name: 'Confirmed cases', value: data[location][0], inline: true },
				{ name: 'Deaths', value: data[location][1], inline: true },
			)
		});

		LocationsEmbed.setTimestamp();

		return LocationsEmbed;
	} else {
		return data;
	}
}

async function getRecoveriesData() {
	var data = await getData(true);
	if (typeof data !== "string") {
		var recoveriesData = data[0].match(/As of (.+), (\d+) people in Alberta have recovered from COVID-19./);
		console.log('A')
		return {
			recoveries_text: recoveriesData[0],
			date: (new Date(recoveriesData[1] + ' 2020')).getTime() + 2.16e7
		};
	} else {
		return data;
	}
}

async function getRecoveriesEmbed() {
	var data = await getRecoveriesData();
	if (typeof data !== "string") {
		console.log('B')
		return new Discord.MessageEmbed()
			.setColor('#00aad2')
			.setTitle('Recoveries in Alberta')
			.setURL('https://www.alberta.ca/covid-19-alberta-data.aspx')
			.setDescription(data.recoveries_text)
			.setTimestamp(data.date)
	} else {
		return data;
	}
}

async function getTestingData() {
	var data = await getData();
	if (typeof data !== "string") {
		var population_M = 4.371;

		var total = data[0].children[2].children[1].children[4];
		return {
			total: total,
			percapita: Math.floor(total / population_M)
		}
	} else {
		return data;
	}
}

async function getTestingEmbed() {
	var data = await getTestingData();
	if (typeof data !== "string") {
		return new Discord.MessageEmbed()
			.setColor('#00aad2')
			.setTitle('Testing in Alberta')
			.setURL('https://www.alberta.ca/covid-19-alberta-statistics.aspx')
			.setDescription('Alberta is testing for COVID-19. We are acting out of an excess of caution even when the likelihood of exposure is low.')
			.addFields(
				{ name: 'Completed tests', value: data.total, inline: true },
			)
			.addField('Per capita testing', data.percapita + " tests per million people")
			.setTimestamp()
	} else {
		return data;
	}
}

module.exports.getLocationsEmbed = getLocationsEmbed;
module.exports.getRecoveriesEmbed = getRecoveriesEmbed;
module.exports.getTestingEmbed = getTestingEmbed;