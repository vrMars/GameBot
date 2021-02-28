# bot.py

import os
import discord
import requests
import websockets
import json
from dotenv import load_dotenv

# load secret bot token
load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

client = discord.Client()

@client.event
async def on_message(message):
    # recursive protection
    if message.author == client.user:
        return
    
    if message.content == '!scrib':
        # Scribl.io logic
        # TODO: Scribbl.io uses recaptcha; try filtering with custom header values
        r = requests.get('https://skribbl.io:4999/socket.io/?EIO=3&transport=polling&t=xxx')
        hackyJson = json.loads(r.text[5:])
        sid1 = hackyJson['sid']
        r = requests.get('https://skribbl.io:4999/socket.io/?EIO=3&transport=polling&t=xxx&sid=' + sid1)

        
        await message.channel.send('Not implemented yet!')

    elif message.content == '!codenames':
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://codenames.game',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://codenames.game/',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        postData = '{"nickname":"GameBot","source":"codenames.game"}'
        r = requests.post('https://lobby.codenames.game/game/create', data = postData, headers=headers)
        outputJson = r.json()
        url = 'https://codenames.game/room/' + outputJson['game']['name']
        await message.channel.send(url)

client.run(TOKEN)

