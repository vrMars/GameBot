const request = require('request');
const Discord = require('discord.js');
const fs = require('fs');
const cheerio = require('cheerio');

const secrets = JSON.parse(fs.readFileSync(__dirname + '/secret.txt', 'UTF-8'));
const daily_id = secrets.DAILY_ID;

const client = new Discord.Client();
let imgUrl = "";
console.log("here");

fs.readFile(__dirname + "/emojiStore.txt", "utf-8", (err, data) => {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log("here2");
	
	data = data.trim();
	cdns = data.split('\n');
	let item = 0;
	fs.readFile(__dirname + "/selectionIndex.txt", "utf8", (err, data) => {
		console.log("here3");
		console.log(err);
		if (err) {
			item = cdns[Math.floor(Math.random() * cdns.length)];
		} else {
			try {
				item = cdns[Number(data)];	
				console.log(item);
			} catch (e) {
				console.log(e);
				item = cdns[Math.floor(Math.random() * cdns.length)];
			}
		}
		imgUrl = item;
		client.login(secrets.DISCORD_TOKEN);
	});
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
			fs.writeFileSync(__dirname + "/lastUpdated.txt", Date.now());
			fs.writeFileSync(__dirname + "/secret.txt", JSON.stringify(secrets));
			client.destroy();
			process.send({custom: 'done!', id: emoji.id});
			process.exit(0);
		});
	} 
});

//client.login();




