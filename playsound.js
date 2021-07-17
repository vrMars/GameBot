const request = require('request');
const Discord = require('discord.js');
const fs = require('fs');

console.log(__dirname);
const secrets = JSON.parse(fs.readFileSync('./secret.txt', 'UTF-8'));

const client = new Discord.Client();

let alias = "";
let mid = null;


client.on('ready', async() => {
	const args = [alias];
	const channels = client.guilds.cache.get('144261525388001280').channels.cache.filter(c => c.type === "voice");
	for (const [channelID, channel] of channels) {
		for (const [memberID, member] of channel.members) {
			if (memberID === mid) {
				console.log(member.voice.channel);
			}
		}
	}
	client.destroy();
//	if (args.length > 1) {
//		message.channel.send("Only supports one argument at a time!");
//	} else if (args[0] === "") {
//		message.channel.send("Please enter a valid idx after \"play sound\"");
//	} else {
//		let idx = args[0];
//
//		const content = fs.readFile("soundAlias.txt", "utf-8", async (err, data) => {
//			if (err) {
//				if (err.code == "ENOENT") {
//					message.channel.send("No audio files to select from!");
//				}
//				console.log(err);
//			} else {
//				const names = data.split('\n');
//				const entries = {};
//				names.forEach((value, idx) => {
//					if (value != "") {
//						const tuple = value.split(" ");
//						entries[tuple[0]] = tuple[1];
//					}
//				});
//					index = entries[idx];
//
//					fs.readFile("soundStore.txt", "utf-8", async (err2, data2) => {
//						if (err2) {
//							if (err2.code == "ENOENT") {
//								message.channel.send("No audio files to select from!");
//							}
//							console.log(err2);
//						} else {
//							try {
//								if (index === undefined) {
//									message.channel.send("Unknown alias / idx.");
//									return;
//								}
//								// find file name
//								const fnames = data2.split('\n');
//								let item = null;
//								fnames.forEach((value, idx) => {
//									if (value != "") {
//										if (idx == index) {
//											item = value;
//										}
//									}
//								});
//
//								if (item === null) {
//									message.channel.send("MP3 not found!");
//									return;
//								}
//
//								if (message.member.voice.channel) {
//									// connect to invoker
//									const connection = await message.member.voice.channel.join();
//									const dis = connection.play(fs.createReadStream("./myinstants_sounds/" + item), { volume: 0.25 });
//
//									dis.on('start', () => {
//										console.log('starting');
//										playing = true;
//									});
//
//									dis.on('finish', () => {
//										console.log('end');
//										playing = false;
//										dis.destroy();
//									});
//
//									dis.on('error', (err) => {
//										playing = false;
//										console.log('err' + err);
//									});
//								}
//								console.log(item);
//							} catch (e) {
//								console.log(e);
//								// silently die >:(
//							}
//
//						}
//					});
//			}
//		});
//	}
});

//client.login();



module.exports = {
	play: function(id, alias) {
		this.mid = id;
		this.alias = alias;
		client.login(secrets.DISCORD_TOKEN);
	}
}
