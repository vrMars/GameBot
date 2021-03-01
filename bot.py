# bot.py

import os
import time
import discord
import requests
from bs4 import BeautifulSoup
import urllib.request as urllib
import json
from dotenv import load_dotenv

# load secret bot token
load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
CODENAMES_ROLE = os.getenv('CODENAMES_ROLE')

client = discord.Client()

@client.event
async def on_message(message):
    # recursive protection
    if message.author == client.user:
        return
    
    if message.content == '!scrib':
        # Scribl.io logic
        # TODO: Scribbl.io uses recaptcha; try filtering with custom header values
        response = requests.post('https://www.google.com/recaptcha/api2/reload', headers=headers, params=params, data=data)
        
        hackyJson = response.text
        print(hackyJson)

        
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
        #print(outputJson)
        creds = outputJson['player']['credential']
        url = 'https://codenames.game/room/' + outputJson['game']['name']
        
        page = urllib.urlopen(url)
        soup = BeautifulSoup(page, 'html.parser')

        #print(soup.body)

        await message.channel.send(url)
        await message.channel.send("<@&%s>" % CODENAMES_ROLE)



        # wait until someone joins
        time.sleep(10)
        leaveUrl = 'https://lobby.codenames.game/game/' + outputJson['game']['name'] + '/leave'
        leaveData = '{"credentials": "' + creds + '"}'
        r = requests.post(leaveUrl, data = leaveData, headers = headers)
        print(r.text)

client.run(TOKEN)

