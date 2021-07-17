const fs = require('fs');
const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const request = require('request');
const cheerio = require('cheerio');
const probe = require('probe-image-size');
const cp = require('child_process');
const URL = require('url');
const https = require('https');
const path = require('path');
const h = require('html-entities');

// cred management
let secrets = JSON.parse(fs.readFileSync(__dirname + '/secret.txt', 'UTF-8'));
let TOKEN = secrets.DISCORD_TOKEN;
let CODENAMES_ROLE = secrets.CODENAMES_ROLE;
let DAILY_ID = secrets.DAILY_ID;
let playing = false;

const client = new Discord.Client();


/**
 * Create a text progress bar
 * @param {Number} value - The value to fill the bar
 * @param {Number} maxValue - The max value of the bar
 * @param {Number} size - The bar size (in letters)
 *
 * @return {String} - The bar
 */
global.progressbar = (value, maxValue, size) => {
  const percentage = value / maxValue; // Calculate the percentage of the bar
  const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
  const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

  const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
  const emptyProgressText = '—'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
  const percentageText = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar

  const bar = '```[' + progressText + emptyProgressText + ']' + percentageText + " Generating link..." + '```'; // Creating the bar
  return bar;
};


let progressBar0 = global.progressbar(0, 100, 20);
let progressBar10 = global.progressbar(10, 100, 20);
let progressBar30 = global.progressbar(30, 100, 20);
let progressBar50 = global.progressbar(50, 100, 20);
let progressBar80 = global.progressbar(80, 100, 20);
let progressBar100 = global.progressbar(100, 100, 20);

let prevProgress = null;

let lastMessage = {};

let browser;

let add = "<@!815643841175486485> add image";
let addSound = "<@!815643841175486485> add sound";
let addSoundAlias = "<@!815643841175486485> set sound alias";
let playSound = "<@!815643841175486485> play";
let help = "<@!815643841175486485> help";
let listStore = "<@!815643841175486485> show saved images";
let listSound = "<@!815643841175486485> show saved sounds";
let removeStore = "<@!815643841175486485> remove image";
let removeSound = "<@!815643841175486485> remove sound";
let selectStore = "<@!815643841175486485> select";
let list = "<@!815643841175486485> list";
let listAll = "<@!815643841175486485> all";
let emoji = "<@!815643841175486485> e";
let register = "<@!815643841175486485> register";

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	browser = await puppeteer.launch({
		headless: true,
		args:['--no-sandbox'],
		executablePath: '/usr/bin/chromium-browser'
	});
	const context = browser.defaultBrowserContext();
	context.overridePermissions("https://skribbl.io", ["clipboard-read"]);
});

client.on('voiceStateUpdate', (oldState, newState) => {
	if (oldState.channelID !== oldState.guild.me.voice.channelID || newState.channel) {
		return;
	}
	if (!oldState.channel.members.size - 1) {
		let timeoutObj = null;
		timeoutObj = setTimeout(() => {
			if (!oldState.channel.members.size - 1) {
				clearTimeout(timeoutObj);
				oldState.channel.leave();
			}
		}, 30000);
	}
});

client.on('message', async (message) => {
	console.log(message);
	if (message.channel.type == 'dm' || message.channel.guild.id != '144261525388001280') {
		return;
	}
	message.content = message.content.toLowerCase();
	if (message.content.startsWith(list)) {
		listPrefix(message);
	} else if (message.content.startsWith(removeStore)) {
		removeStorePrefix(message);
	} else if (message.content.startsWith(removeSound)) {
		removeSoundPrefix(message);
	} else if (message.content.startsWith(listStore)) {
		listStorePrefix(message);
	} else if (message.content.startsWith(listSound)) {
		listSoundPrefix(message);
	} else if (message.content.startsWith(selectStore)) {
		selectStorePrefix(message);
	} else if (message.content.startsWith(add)) {
		addPrefix(message);
	} else if (message.content.startsWith(emoji)) {
		emojiPrefix(message);
	} else if (message.content.startsWith(listAll)) {
		listAllPrefix(message);
	} else if (message.content.startsWith(addSound)) {
		addSoundPrefix(message);
	} else if (message.content.startsWith(addSoundAlias)) {
		addSoundAliasPrefix(message);
	} else if (message.content.startsWith(playSound)) {
		playSoundPrefix(message);
	} else if (message.content.startsWith(register)) {
		registerPrefix(message);
	} else if (message.content.startsWith(help)) {
		let helpText = "Available commands:\n - add [image, sound] [Emoji link] (Emoji link must point to img of size 128x128 px or less / Sound link must be sourced from \"myinstants.com\") \n - show saved [images, sounds] (Outputs list of saved resources and their respective aliases) \n - remove [Emoji idx] (Removes emoji at idx from pool) \n - list [@User] (Lists emoji's owned by @User) \n - all (Lists all owners and their respective emoji's on this server.) \n - e [:emoji:] (Lists owner for this emoji) \n - select [Emoji idx] (Choose emoji at idx as next emoji) \n - play [sound idx/alias] (Connects to invoker's voice channel and plays specified sound) \n - set [sound] alias [idx] [string alias] (Saves an easy to use alias to repersent the image/sound at specified index) \n - help (Displays help) \n";
		message.channel.send(helpText);
	}
	let curTime = Date.now();
	let prevTime = 0;
	if (lastMessage[message.author.id] != null) {
		prevTime = lastMessage[message.author.id]	
	}
	if (Math.abs(curTime - prevTime) / 1000 < 5 || prevProgress != null) {
		if (message.content == "!scrib" || message.content == "!codenames") {
			message.channel.send("No spamming!");
			return;
		}
	} else {
		lastMessage[message.author.id] = curTime;
	}
	if (message.author == client.user) {
		switch(message.content) {
			case progressBar0:
			case progressBar10:
			case progressBar30:
			case progressBar50:
			case progressBar80:
			case progressBar100:
				prevProgress = message;
				break;
			case "No spamming!":
				break;
			default:
				// scrib message
				if (prevProgress != null) {
					prevProgress.delete();
				}
				prevProgress = null;
		}
		return;
	}
	
	if (message.content == "!scrib") {
		message.channel.send(progressBar0);
		const page = await browser.newPage();
		await page.goto(
			"https://skribbl.io/",
			{
				"waitUntil": "networkidle2"
			}
		);
		prevProgress.edit(content=progressBar10);

		const nick = await page.$x('//input[@id="inputName"]');
		await nick[0].type("GameBot");

		const privateRoom = await page.$x('//button[@id="buttonLoginCreatePrivate"]');
		await privateRoom[0].click();
		prevProgress.edit(content=progressBar30);
		//message.channel.send(progressBar30);
		
		await page.waitForXPath('//button[@id="inviteCopyButton"]', {"visible": true});
		prevProgress.edit(content=progressBar50);
		//message.channel.send(progressBar50);

		const copyLink = await page.$x('//button[@id="inviteCopyButton"]');
		await copyLink[0].click();

		prevProgress.edit(content=progressBar80);
		//message.channel.send(progressBar80);

		const result = await page.evaluate(() => {
		  function copyText(selector) {
			var copyText = document.querySelector(selector);
			copyText.select();
			document.execCommand("Copy");
			return copyText.value;
		  }
		  return copyText("#invite");
		});

		//message.channel.send(progressBar100);
		prevProgress.edit(content=progressBar100);

		message.channel.send(result);

		// wait until someone joins, then leave!
		try {
			await page.waitForXPath('/html/body/div[3]/div[5]/div[2]/div[2]/div[2]/div[2]', {
				"timeout": 120 * 1000
			});
		} catch (error) {
			// timed out
			console.log("timed out");
		}

		await page.close();
		
	} else if (message.content == "!codenames") {
		// codenames logic
		message.channel.send(progressBar0);
		const page = await browser.newPage();
		await page.goto(
			"https://codenames.game/room/create", 
			{
				"waitUntil": "networkidle2"
			}
		);
		prevProgress.edit(content=progressBar10);
		const nick = await page.$x('//input[@id="nickname-input"]');
		await nick[0].type('gamebot');
		const btn = await page.$x('//button[@type="submit"]');
		await btn[0].click();
		const englishPath = '/html/body/div/div/div/div/div[3]/div/main/div[2]/main/section/div[2]/details/div/div/button[2]/div/div';
		prevProgress.edit(content=progressBar30);
		await page.waitForXPath(englishPath, {"visible": true});
		prevProgress.edit(content=progressBar50);
	
		const english = await page.$x(englishPath);
		try {
			await english[0].click();
		} catch (error) {
			// not clickable atm
			console.log('dont need to click english');
		}
		prevProgress.edit(content=progressBar80);
		await page.screenshot({ path: `github-profile.jpeg` });
		const start = await page.$x('//*[@id="gamescene"]/main/div[2]/main/footer/button');
		console.log(start);
		await start[0].click();
		
		prevProgress.edit(content=progressBar100);

		message.channel.send(page.url());
		message.channel.send(`<@&${CODENAMES_ROLE}>`);

		// admin transfer handling
		const divXPath = '/html/body/div/div/div/div/div[3]/div/main/div[2]/nav/div/div[1]/div/button/div';
		let div = await page.$x(divXPath);
		let val = await page.evaluate((d) => d.innerText, div[0]);
		let itCount = 0;

		while (val.split('\n')[1] === "1" && itCount < 60) {
			div = await page.$x(divXPath);
			val = await page.evaluate((d) => d.innerText, div[0]);
			await page.waitForTimeout(500);
			itCount += 1
		}

		if (itCount >= 60) {
			// inactive lobby
			console.warn('inactive lobby');
			await page.close();
			return;
		}
		// make first joined player admin
		await div[0].click();
		const player2 = await page.$x('/html/body/div/div/div/div/div[3]/div/main/div[2]/nav/div/div[1]/div/main/div/section/div/div[2]');
		await player2[0].click();

		const player2HostButton = await page.$x('/html/body/div/div/div/div/div[3]/div/main/div[2]/nav/div/div[1]/div/main/div/section/div/div[2]/main/main/section/div[1]/button');
		await player2HostButton[0].click();
		
		//done
		await page.close();
		console.log("Room online!");
	}

})


client.login(TOKEN);

async function testImage(url) {
	return new Promise((resolve, reject) => {
		request(url, async (err, resp, body) => {
			if (err) { return reject(err); }
			if (!resp) {
				return reject("bad url");
			}
			if((((resp.headers['content-type']).match(/(image)+\//g)) != null) && ((resp.headers['content-type']).match(/(image)+\//g)).length != 0){
				let result = await probe(url);
				if (result.width <= 128 && result.height <= 128) {
					return resolve(resp.statusCode);
				} else {
					return reject("image dimensions exceed 128x128 px limit!");
				}
			} else {
				return reject("not an image");
			}
		});
	});
}
async function download(url, resolve){

    if (url == null) {
        console.log("All done.");
		return;
    }

    var parsedUrl = URL.parse(url);

    var url_options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: "GET"
    };

	console.log(url_options);

    https.request( url_options, res => {

        var data = "";
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => {

            var reg = /onmousedown="play\(\'\/media\/sounds\/(.+)\'\)/g
			var re2 = /"instant-page-title">(.+)<\/h1>/g
			var mp3name = reg.exec(data)[1];
            var name = h.decode(re2.exec(data)[1]) + ".mp3";
            // reuse our old object, just reset the path
            url_options.path = "/media/sounds/" + mp3name;

            var ws = fs.createWriteStream( path.join( __dirname, "/myinstants_sounds", name));
            ws.on('finish', () => {
                console.log(name);
				resolve(name);
            });

            https.request( url_options, res => res.pipe( ws )).end();

        });


    }).end();
}

function testAudio(url) {
	return new Promise(async (resolve, reject) => {
		await download(url,resolve);
	});
}

async function listPrefix(message) {
	const args = message.content.slice(list.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one argument at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please tag the user after list");
	} else {
		let listUser = args[0];
		let numb = listUser.match(/\d/g);
		listUser = numb.join("");
		let owned = [];
		let emojis = client.emojis.cache.values();
		let i = 0;
		for (const tmp of emojis) {
			let author = await tmp.fetchAuthor();
			if (author.id === listUser && tmp.animated == false) {
				owned.push("<:" + tmp.name + ":" + tmp.id + ">");
			}
			i += 1;
		}
		if (owned.length == 0) {
			message.channel.send("This user doesn't own any emotes <:weirdChamp:825071030694838333>");
		} else {
			message.channel.send(owned.join(" "));
		}
	}
}

async function addSoundAliasPrefix(message) {
	const args = message.content.slice(addSoundAlias.length).trim().split(' ');
	if (args.length > 2 || args.length == 1) {
		message.channel.send("Only supports two arguments at a time!");
	} else if (args[0] == "" || args[1] == "") {
		message.channel.send("Please enter a valid [idx, alias] pair");
	} else {
		let aliasIdx = cleanInt(args[0]);
		if (isNaN(aliasIdx) || aliasIdx < 0) {
			message.channel.send("Please enter a valid index");
		} else {
			let aliasNameIntCheck = cleanInt(args[1]);
			if (!isNaN(aliasNameIntCheck)) {
				message.channel.send("Can't use numbers as an alias");
			} else {
				fs.readFile(__dirname + "/soundStore.txt", "utf-8", (err, data) => {
					if (err) throw err;
					if (data === "") {
						message.channel.send("Can't set alias for invalid idx.");
					} else {
						let size = data.split("\n").length;
						if (aliasIdx > size - 2) {
							message.channel.send("Can't set alias for invalid idx.");
						} else {
							let aliasName = String(args[1]);
							fs.readFile(__dirname + "/soundAlias.txt", "utf-8", (err, aliasData) => {
								if (err) {
									if (err.code == "ENOENT") {
										fs.appendFile(__dirname + "/soundAlias.txt", aliasName + " " + String(aliasIdx) + '\n', (err) => {
											if (err) throw err;
											message.channel.send("Saved alias!");
										});
									}
								} else {
									const tup = aliasData.split('\n');
									let enumx = {};
									tup.forEach((value, idx) => {
										if (value != "") {
											const spl = value.split(' ');
											enumx[spl[0]] = spl[1];
										}
									});
									if (enumx.hasOwnProperty(aliasName)) {
										message.channel.send("Alias mapping already exists!");
									} else {
										fs.appendFile(__dirname + "/soundAlias.txt", aliasName + " " + String(aliasIdx) + '\n', (err) => {
											if (err) throw err;
											message.channel.send("Saved alias!");
										});
									}
								}
							});
						}
					}
				});
			}
		}
	}
}

async function registerPrefix(message) {
	const id = message.author.id;
	let token = 0;
	require('crypto').randomBytes(48, function(ex, buf) {
		token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
	});
	// ignore args
	const content = fs.readFile("apiMap.txt", "utf-8", async (err, data) => {
		if (err) {
			if (err.code == "ENOENT") {
				fs.appendFile("apiMap.txt", id + " " + token + '\n', (err) => {
					if (err) {
						throw err;
					}
					message.channel.send("Registered! Check your DMs.");
					client.users.cache.get(id).send("Your private api token is: ||\`" + token + '\`||');
				});
			}
		} else {
			if (data.includes(id)) {
				message.channel.send("Already registered! Check your DMs.");
				const rows = data.split('\n');
				rows.forEach(r => {
					const spl = r.split(" ");
					if (spl[0] == id) {
						client.users.cache.get(id).send("Your private api token is: ||\`" + spl[1] + '\`||');
						return;
					}
				});
			} else {
				fs.appendFile("apiMap.txt", id + " " + token + '\n', (err) => {
					if (err) {
						throw err;
					}
					message.channel.send("Registered! Check your DMs.");
					client.users.cache.get(id).send("Your private api token is: ||\`" + token + '\`||');
				});
			}
		}
	});
}

async function addSoundPrefix(message) {
	const args = message.content.slice(addSound.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one argument at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please enter a valid mp3 link after \"add sound\" [mp3 should be small & short for best result!]");
	} else {
		let addSoundUrl = args[0];
		testAudio(addSoundUrl)
			.then((result) => {
				const name = result;
				fs.readFile(__dirname + "/soundStore.txt", "utf-8", (err, data) => {
					if (err) {
						if (err.code == "ENOENT") {
							size = NaN;
							fs.appendFile(__dirname + "/soundStore.txt", name + '\n', (err) => {
								if (err) throw err;
								message.channel.send("Saved!");
								size = data.split('\n').length - 1;
								if (!isNaN(size)) {
									fs.appendFile(__dirname + "/soundAlias.txt", String(size) + " " + String(size) + '\n', (err) => {
										if (err) throw err;
										console.log("saved new sound alias");
									});
								}
							});
						}
					} else {
						if (data.includes(name)) {
							message.channel.send("Sound already exists!");
						} else {
							size = NaN;
							fs.appendFile(__dirname + "/soundStore.txt", name + '\n', (err) => {
								if (err) throw err;
								message.channel.send("Saved!");
								size = data.split('\n').length - 1;
								if (!isNaN(size)) {
									fs.appendFile(__dirname + "/soundAlias.txt", String(size) + " " + String(size) + '\n', (err) => {
										if (err) throw err;
										console.log("saved new sound alias");
									});
								}
							});
							
						}
					}
				});
			});
	}

}

async function listSoundPrefix(message) {
//	let page = await browser.newPage();
//
//	await page.goto(
//		"http://localhost/gamechan", 
//		{
//			"waitUntil": "networkidle2"
//		}
//	);
//
//	await page.waitForSelector('body > ul.soundl');
//	const el = await page.$('body > ul.soundl');
//	await el.screenshot({path: 'sound.png'});
//	await page.close();
	message.channel.send("Go to http://neelaksh.duckdns.org/gamechan");
}

async function playSoundPrefixAlias(id, alias) {
	const args = [alias];
	let idx = args[0];

	const content = fs.readFile(__dirname + "/soundAlias.txt", "utf-8", async (err, data) => {
		if (err) {
			console.log(err);
		} else {
			const names = data.split('\n');
			const entries = {};
			names.forEach((value, idx) => {
				if (value != "") {
					const tuple = value.split(" ");
					entries[tuple[0]] = tuple[1];
				}
			});
			index = entries[idx];

			fs.readFile(__dirname + "/soundStore.txt", "utf-8", async (err2, data2) => {
				if (err2) {
					console.log(err2);
				} else {
					try {
						if (index === undefined) {
							return;
						}
						// find file name
						const fnames = data2.split('\n');
						let item = null;
						fnames.forEach((value, idx) => {
							if (value != "") {
								if (idx == index) {
									item = value;
								}
							}
						});

						if (item === null) {
							return;
						}
						let savemem = null;
						const channels = client.guilds.cache.get('144261525388001280').channels.cache.filter(c => c.type === "voice");
						for (const [channelID, channel] of channels) {
							for (const [memberID, member] of channel.members) {
								if (memberID === id) {
									savemem = member;
									break;
								}
							}
						}
						if (savemem) {
							const connection = await savemem.voice.channel.join();
							const dis = connection.play(fs.createReadStream(__dirname + "/myinstants_sounds/" + item), { volume: 0.25 });

							dis.on('start', () => {
								console.log('starting');
								playing = true;
							});

							dis.on('finish', () => {
								console.log('end');
								playing = false;
								dis.destroy();
							});

							dis.on('error', (err) => {
								playing = false;
								console.log('err' + err);
							});
						}
						console.log(item);
					} catch (e) {
						console.log(e);
						// silently die >:(
					}

				}
			});
		}
	});
}

async function playSoundPrefix(message) {
	const args = message.content.slice(playSound.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one argument at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please enter a valid idx after \"play sound\"");
	} else {
		let idx = args[0];
		console.log(__dirname);	
		const content = fs.readFile(__dirname + "/soundAlias.txt", "utf-8", async (err, data) => {
			if (err) {
				if (err.code == "ENOENT") {
					message.channel.send("No audio files to select from!");
				}
				console.log(err);
			} else {
				const names = data.split('\n');
				const entries = {};
				names.forEach((value, idx) => {
					if (value != "") {
						const tuple = value.split(" ");
						entries[tuple[0]] = tuple[1];
					}
				});
					index = entries[idx];

					fs.readFile(__dirname + "/soundStore.txt", "utf-8", async (err2, data2) => {
						if (err2) {
							if (err2.code == "ENOENT") {
								message.channel.send("No audio files to select from!");
							}
							console.log(err2);
						} else {
							try {
								if (index === undefined) {
									message.channel.send("Unknown alias / idx.");
									return;
								}
								// find file name
								const fnames = data2.split('\n');
								let item = null;
								fnames.forEach((value, idx) => {
									if (value != "") {
										if (idx == index) {
											item = value;
										}
									}
								});

								if (item === null) {
									message.channel.send("MP3 not found!");
									return;
								}

								if (message.member.voice.channel) {
									// connect to invoker
									const connection = await message.member.voice.channel.join();
									const dis = connection.play(fs.createReadStream(__dirname + "/myinstants_sounds/" + item), { volume: 0.25 });

									dis.on('start', () => {
										console.log('starting');
										playing = true;
									});

									dis.on('finish', () => {
										console.log('end');
										playing = false;
										dis.destroy();
									});

									dis.on('error', (err) => {
										playing = false;
										console.log('err' + err);
									});
								}
								console.log(item);
							} catch (e) {
								console.log(e);
								// silently die >:(
							}

						}
					});
			}
		});
	}
}

async function addPrefix(message) {
	const args = message.content.slice(add.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one argument at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please enter a valid cdn link after \"add\" [img should be 128x128 for best result!]");
	} else {
		let addCdn = args[0];

		testImage(addCdn)
			.then(async (result) => {
				// check if cdn already exists
				const content = fs.readFile(__dirname + "/emojiStore.txt", "utf-8", (err, data) => {
					if (err) {
						if (err.code == "ENOENT") {
							// file doesnt exist
							fs.appendFile(__dirname + '/emojiStore.txt', addCdn + '\n', (err) => {
								if (err) throw err;
								message.channel.send("Saved!");
							});
						}
					} else {
						if (data.includes(addCdn)) {
							message.channel.send("CDN already exists!");
						} else {
							fs.appendFile(__dirname + '/emojiStore.txt', addCdn + '\n', (err) => {
								if (err) throw err;
								message.channel.send("Saved!");
							});
						}
					}
				});
			})
			.catch(err => {
				console.log(err);
				message.channel.send("Bad Url!");
				message.channel.send("Error: " + err);
			});
	}
}

async function listStorePrefix(message) {
//	let page = await browser.newPage();
//
//	await page.goto(
//		"http://localhost/gamechan", 
//		{
//			"waitUntil": "networkidle2"
//		}
//	);
//
//	await page.waitForSelector('body > ul.imgl');
//	const el = await page.$('body > ul.imgl');
//	await el.screenshot({path: 'store.png'});
//	await page.close();
	message.channel.send("Go to http://neelaksh.duckdns.org/gamechan");
}

async function selectStorePrefix(message) {
	const args = message.content.slice(selectStore.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one selection at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please enter a valid index to select after \"select\" [use \"@Gamechan show saved\" to preview emotes]");
	} else {
		let idx = cleanInt(args[0]);
		if (isNaN(idx) || idx < 0) {
			message.channel.send("Please enter a valid index");
			return;
		}
		// check if cdn already exists
		const content = fs.readFile(__dirname + "/emojiStore.txt", "utf-8", (err, data) => {
			if (err) {
				if (err.code == "ENOENT") {
					// file doesnt exist
					message.channel.send("No CDN's to select from!");
				}
				console.log(err);
			} else {
				tot = data.split('\n').length - 2;
				if (idx > tot) {
					message.channel.send("Please enter a valid index [0 - " + tot + "]");
					return;
				}
				fs.writeFile(__dirname + '/selectionIndex.txt', '' + idx, (err) => {
					if (err) throw err;
					console.log("saved");
					var n = cp.fork(__dirname + '/img.js');
					n.on('message', (msg) => {
						DAILY_ID = msg.id;
						message.channel.send("Emoji selected!");
					});
				})

			}
		});
	}
}

function cleanInt(x) {
	    x = Number(x);
	    return x >= 0 ? Math.floor(x) : Math.ceil(x);
}

async function removeSoundPrefix(message) {
	const args = message.content.slice(removeSound.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one removal at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please enter a valid index to remove after \"remove sound\" [use \"@Gamechan show saved sounds\" to preview sounds]");
	} else {
		let idx = cleanInt(args[0]);
		if (isNaN(idx) || idx < 0) {
			message.channel.send("Please enter a valid index");
			return;
		}
		// check if cdn already exists
		const content = fs.readFile("soundStore.txt", "utf-8", (err, data) => {
			if (err) {
				if (err.code == "ENOENT") {
					// file doesnt exist
					message.channel.send("No sounds left to delete!");
				}
				console.log(err);
			} else {
				names = data.split("\n");
				names.splice(names.length - 1, 1);
				oldnames = JSON.parse(JSON.stringify(names));
				const elem = names[idx];
				names.splice(idx, 1);
				if (oldnames.length == names.length) {
					message.channel.send("No changes made");
				} else {
					if (names.length == 0) {
						fs.writeFile('soundStore.txt', names.join('\n'), (err) => {
							if (err) throw err;
							message.channel.send("Updated!");
							fs.unlink("./myinstants_sounds/" + elem, (err) => {
								if (err) throw err;
								return;
							});

							fs.readFile("soundAlias.txt", "utf-8", (err, aliasData) => {
								if (err) throw err;
								let aliases = aliasData.split('\n');
								for (let i = 0; i < aliases.length; i++ ){
									let value = aliases[i];
									if (value != "") {
										let kvp = value.split(' ');
										let map = cleanInt(kvp[1]);
										if (!isNaN(map)) {
											if (map === idx) {
												// delete this entry
												aliases.splice(i, 1);
												i -= 1;
											}
										}
									}
								}
								
								fs.writeFile("soundAlias.txt", aliases.join('\n'), (err) => {
									if (err) throw err;
									console.log("updated aliases");
								});
							});


						});
					} else {
						fs.writeFile('soundStore.txt', names.join('\n') + '\n', (err) => {
							if (err) throw err;
							message.channel.send("Updated!");
							fs.unlink("./myinstants_sounds/" + elem, (err) => {
								if (err) throw err;
								return;
							});
							fs.readFile("soundAlias.txt", "utf-8", (err, aliasData) => {
								if (err) throw err;
								let aliases = aliasData.split('\n');
								for (let i = 0; i < aliases.length; i++ ){
									let value = aliases[i];
									if (value != "") {
										let kvp = value.split(' ');
										let map = cleanInt(kvp[1]);
										if (!isNaN(map)) {
											if (map === idx) {
												// delete this entry
												aliases.splice(i, 1);
												i -= 1;
											}
										}
									}
								}

								fs.writeFile("soundAlias.txt", aliases.join('\n'), (err) => {
									if (err) throw err;
									console.log("updated aliases");
								});
							});
						});
					}
				}

			}
		});
	}
}

async function removeStorePrefix(message) {
	const args = message.content.slice(removeStore.length).trim().split(' ');
	if (args.length > 1) {
		message.channel.send("Only supports one removal at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please enter a valid index to remove after \"remove\" [use \"@Gamechan show saved\" to preview emotes]");
	} else {
		let idx = cleanInt(args[0]);
		if (isNaN(idx) || idx < 0) {
			message.channel.send("Please enter a valid index");
			return;
		}
		// check if cdn already exists
		const content = fs.readFile(__dirname + "/emojiStore.txt", "utf-8", (err, data) => {
			if (err) {
				if (err.code == "ENOENT") {
					// file doesnt exist
					message.channel.send("No CDN's left to delete!");
				}
				console.log(err);
			} else {
				cdns = data.split("\n");
				cdns.splice(cdns.length - 1, 1);
				oldCdns = JSON.parse(JSON.stringify(cdns));
				cdns.splice(idx, 1);
				console.log(oldCdns);
				console.log(cdns);
				if (oldCdns.length == cdns.length) {
					message.channel.send("No changes made");
				} else {
					if (cdns.length == 0) {
						fs.writeFile(__dirname + '/emojiStore.txt', cdns.join('\n'), (err) => {
							if (err) throw err;
							message.channel.send("Updated!");
						});
					} else {
						fs.writeFile(__dirname + '/emojiStore.txt', cdns.join('\n') + '\n', (err) => {
							if (err) throw err;
							message.channel.send("Updated!");
						});
					}
				}

			}
		});
	}
}

async function listAllPrefix(message) {
	const args = message.content.slice(list.length).trim().split(' ');
	let owned = new Map();
	let emojis = client.emojis.cache.values();
	let i = 0;
	for (const tmp of emojis) {
		let author = await tmp.fetchAuthor();
		if (tmp.animated == false) {
			if (!owned.has(author.username)) {
				owned.set(author.username, ["<:" + tmp.name + ":" + tmp.id + ">"]);
			} else {
				let old = owned.get(author.username);
				old.push("<:" + tmp.name + ":" + tmp.id + ">");
				owned.set(author.username, old);
			}
		}
		i += 1;
	}
	if (owned.size == 0) {
		message.channel.send("This channel doesn't own any emotes <:weirdChamp:825071030694838333>");
	} else {
		for (const [key, value] of owned.entries()) {
			if (value.length == 0) {
				message.channel.send(key + " doesn't own anything <:weirdChamp:825071030694838333>");
			} else {
				console.log(value.join(" "));
				message.channel.send(key + " owns: " + value.join(" "));
			}
		}
	}
}

async function emojiPrefix(message) {
	const args = message.content.slice(emoji.length).trim().split(' ');
	console.log(args);
	if (args.length > 1) {
		message.channel.send("Only supports one argument at a time!");
	} else if (args[0] === "") {
		message.channel.send("Please tag the emoji after e");
	} else {
		let listEmoji = args[0];
		let numb = listEmoji.match(/\d/g);
		if (numb == null) {
			message.channel.send("That emote doesnt exist <:yikes:825071006741430314>");
			return;
		}
		listEmoji = numb.join("");

		let emojis = client.emojis.cache.values();
		for (const tmp of emojis) {
			if (tmp.id == listEmoji) {
				let author = await tmp.fetchAuthor();
				message.channel.send("<:" + tmp.name + ":" + tmp.id + "> is owned by " + author.username);
				break;
			}
		}
	}
}

module.exports.playSoundPrefixAlias = playSoundPrefixAlias;
