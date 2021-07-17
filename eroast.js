const request = require('request');
const Discord = require('discord.js');
const fs = require('fs');
const cheerio = require('cheerio');

const secrets = JSON.parse(fs.readFileSync('./secret.txt', 'UTF-8'));
const daily_id = secrets.DAILY_ID;

const client = new Discord.Client();
let imgUrl = "";

fs.readFile("emojiStore.txt", "utf-8", (err, data) => {
	if (err) {
		console.log(err);
		throw err;
	}
	
	data = data.trim();
	cdns = data.split('\n');
	let item = cdns[Math.floor(Math.random() * cdns.length)];
	imgUrl = item;
	client.login(secrets.DISCORD_TOKEN);
});

client.on('ready', async() => {
	let values = client.guilds.cache.values();
	let guildManager = values.next().value;
	let curDaily = guildManager.emojis.cache.get(daily_id);
	if (curDaily != null && curDaily.name == "random" && curDaily.id == daily_id) {
		curDaily.delete("new daily incoming!!");
		// create new daily
		guildManager.emojis.create(imgUrl, 'random').then(emoji => {
			secrets.DAILY_ID = emoji.id;
			fs.writeFileSync("./lastUpdated.txt", Date.now());
			fs.writeFileSync('./secret.txt', JSON.stringify(secrets));
			client.destroy();
			process.send({custom: 'done!', id: emoji.id});
			process.exit(0);
		});
	}
});

//client.login();




