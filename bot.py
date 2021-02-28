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
        headers = {
            'authority': 'www.google.com',
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'dnt': '1',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36',
            'content-type': 'application/x-protobuffer',
            'accept': '*/*',
            'origin': 'https://www.google.com',
            'x-client-data': 'CKW1yQEIkrbJAQiktskBCMG2yQEIqZ3KAQj4x8oBCKPNygEI3NXKAQinnMsBCMWcywEI5JzLAQioncsBCLafywE=',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://www.google.com/recaptcha/api2/anchor?ar=1&k=6LeFbcgUAAAAAHQcfuuaFjakmubtKjKCmYM5cbIJ&co=aHR0cHM6Ly9za3JpYmJsLmlvOjQ0Mw..&hl=en&v=jxFQ7RQ9s9HTGKeWcoa6UQdD&size=invisible&cb=tfgaprl5rkib',
            'accept-language': 'en-US,en;q=0.9',
            'cookie': '__Secure-3PAPISID=BX_UVGNXupRht3RW/A7TppY8SZtAxDalsL; ANID=AHWqTUmAeXV0UleL2hLwJTlxny_HgkkwRsmk2_dzNtyoeXEkLSfiPZ4elM4U8RKj; __Secure-3PSID=7AfqWwjkYOsqLNChRw7WokaYm0K5EHYEHg9gyZIx_EdErZw7cOaqJvwwJCstoMc4mo_wdQ.; 1P_JAR=2021-02-28-20; NID=210=0zJZhesMzjhO0KejvKCcqcmp5-lwFUrXbaaJL7FDt_rj4oH-AcywGT0pBfSOziMm4L4OVlpN_39pujIShgXMLqIwWfFwQbAxckfoWjRx99djMpDsv7WEMW6oa8KHoFMQPXV0k66KjF7qVygspXW61CHnxAAhsKpT7-NttGPAxPTz_f3s51nzRgyKMJkj0dMpOuss10_HRG-SCvljeUS6x-L2y7pEKAqFR6F1zPfV5WIJooo5nPyUzWJSr6zg7IXwQxuwYRi3ZDiExQOkEJLj2gFPt1QtBC1LeRul6ZfJEWjvBXBeXx9irCxgPF-1R-nF0Ojtwkm4wEo6UQ; __Secure-3PSIDCC=AJi4QfHJVXPIrHlX3nTM0VOMyODYxPEuMbJXJlFpfDxTAskRvItCO11h6Pe_sCZ4ypz9su1ua5Nx',
        }

        params = (
            ('k', '6LeFbcgUAAAAAHQcfuuaFjakmubtKjKCmYM5cbIJ'),
        )

        data = '$\\n\\u0018jxFQ7RQ9s9HTGKeWcoa6UQdD\\u0012\xB9\\u000803AGdBq26WrZEwUc5V2rxIasDhBBMmlP9oNtHVFSBDOQVHWKJ58Dr3mBFYN2ifKsQm-y557IGy5O88uP9DtPij47GSpjy1a9l6z6GrqscnzVO7UgEBeGoApQOCF3h-wIZcnr4tpimJ6OdWRmnY9hLCjhYkoBHeqgQINxB_ldThg0W13JWwPF0YcT4rDZdCrlDd--KaHksKZ_ba1xCO3ddBOIww_QydR_jBSSnSxn4tT3sf3-tvAUTPHX9dwG_jajUMXgo-r_EgUMq8Qk0c9b4pynXFbvKLj30zdn1Qk-U-juROeoRLBfVzz08NeC4owRcZf73BZCKEES2HIX-VzwZri1U3iH7HAK_9PUXNcRT5-fcCmw7aVxcJg_speOLiSrPcCntLXiMkCUI-bLetUmewWFH9bazwyShuMyc8ezl4ik73l6ImdanXRV3odp3r8RDkbMTKMtP1IunR9dB_xG1tM_ztBFKYgQXGQmC_V-EvO6FDCFEnPsuHNhzgL8hoLIlow44_CxZxOH4SBALdmTYigrzj3AeGGxiNI1KqVwFja7bH2S6S-HXUHGhDH2oGKQxP43XnUVBz3M-c6ozt78qRY-aiFspCtlk_04LEwW8ccZTsDhctAweE6Vj_oSTlODJAnMFDAaLsOs4hkNlIBDRsc2ZoJBC_Gh_FVT1ewn2BJJY6iaJp54zMzulHtTQxrskb0pkb__VLnoshBHoxB_DEiUHQdi-NRwmROKX-ifAfeDRMAV8fM5xGh7SaUm7VjOwXFuChYLPjxgUR6dF7ALmyDsvezCAvk4u6cnVJZ1k0Arp0xhSZImyjO9EkaYLw-HQJtBBQD2d0n4otjD_bsx7Q_7_ZnBT2QkRJJZpZsw7qAlVeL0OJFBJzD3LSY9YNOCysYebcl8y-lVshcZxlBeqJc8bhtx4SpPL3sS_ekmxiGkEqV-Jjk19MZ_UGtPhtJjVugxiPPYgl-aTzveXy-N3Mg7zCULrpqF0XCkMrT7aRVkPpWDQS_NM_A79Jbw_7GbEYkbIQoU6Mi2UybrYMK2ZFn5cKMf6y-0XV33onZcPisUOOYSQPK7MmwE4\\u001a\\u0009[33,7,34]"\xCC\\u001d\\u0021uL6gvvLIAAUjJDx_I0fz4kHxvh10IT4AKQAjCPxGhn4ErgdjN9EFaldkMXn6xotzDafgU-dwr_IQc53GSHgV17ngBwAAAMxXAAAAB20BB5wKxk_5I8xUoXkRzlhHOcvc7DbEMK8I_S6GQPrcLEZuyO7yCY-IjqYfNQjH34F5It2oHHu333YZ3vhULpXRhUUZ8LFyXdGhQzUG69dj3Rmzb7qOGkZ6bm9zqCzowWjdri6ErY72TPubgZQsVEmPQ_ACfzb-zY-WckWqbDHQ_a8CFyAuuymWoBPe0zusB4_RxLs0AiAKo70VnEhz1M7Osz9h_ymcHsdte0VdhZ8sRtm3mJwVGD1zcmTNVOaZri2hkpR9lZurGBJoFWAJlSH3e3GumOUuq8SRT_okztvrcVfhqn1Nl5lOXkErdNCaGvKQtvJXYRxSxWf4qfOD9JIPYQbGXP8Wi_LIOt5xaSckttSEoVrJIJZswZUoUFMDAbFXsKCi8U4nde3WkUo5LtaccmvgudkuOoXIb8kS2l7IszXIzLXszzyVFm2rj_ADjYnGfkXF14cnCdWAuhmAR-xBWffD5-YHkMbUASDoK1BNItzhfd6031onVHAC6YWF4QB4KsZDbFBEY-KkN64bj-SZ0JmnTNNB6kTydfqf0UfUoNmZLAMMx2oiExTm5DriquN6sJdNzBRUQpoLagsHDFN2AdxL1zF5zAQYA1a1g7f_4Tq9kx5A7ozbPQTDt0FgdD77C31awUMjDaoC6gU4mll1CBR70Wc6QRNYC3PTp8vEgkwvhDLHEPbh-z4OHYvM8Rgr0aJDLnAlUvLQS2J6YxLGjJi75bcpHFrbD2V4y5AGBrCvSWwdjIQpmSGxuR2cPIFPJMDyCexkEDUIp_cT1PCIM5dUThUgi2UW7TIB0vx5uotiKhWcd6kz95jtBh7-QM532j2QqyP_vZAIKc5zIlbz62q4ez3V3z9ayfDlmNxmW6PkLhYVQ7NF0YuRqFXcGr7-TD37QNrkEci9lr5pYwCC5xtIHlTPJtR2810amKLSOE5wtbYa3ivoG5nyZwbrJH5Dpg4yb86OaCwmEvHiBjzxLk9FbUdQKpEPZf9NrhgBg2Y7P1o-q0nG3uUrerIdAYRcgOWmjF9--H76JyhW80S2DcgqiCddsIiTgRDbwFrYhUOfZqsUX1hWdbNN9a0l0VUb4-GWdi12njCvCWUW98CkeIOrbkTyMGbqmjjD7wSJBXznMBrW2Jm2DxcNErrH_vJQZ49vi0EiiyzEhG6FmXZC9IIdKVFc3T6B8Q1Kb363SLYRMGI7yneom_Xq4YV5q3Mxz-s11IlSSUiBmmwEWpmjR6ITZJFQ2gbWNmNaH2kZmLwy3yvCWRroTDj9SNIhn_dG88_b9P30udx_jSmDgAwJoqHBBUoqraYxDmPX_d8ZZP4VniNVLYn0o8PY0d-aIsm9CuuonWVlTsmoyezlXg3GP1yQZAOH80Ol-VPtZkBFAmzC9fN5WiYILaexColEAt5MB6oRCWbo1TAAmyZr5evW03eEcOoS8C7VJRHg5Y3RHq-4dfhoGqWIlRo4mV_MMNJTJijLrmah1XePv4MCqYBzHTFoT5fTwuXXPvDIM42rrZQwhBmd5S6k5AG9mu8_jiHbCIvSAOSFOVJBSPc-g-rPGAwoJ7KuCV3vQFDXYSU_AJcSrd2qaFm1CElVSebqn_H1tG6Wrs9x8IFi9Hb1sYpH0ORKiPYcHVq5hvi_oR_QwK0CNYH1Fn7c8Z7gkVQfa02TI5tYbRduX338HRbGbu5BKNYbBSKeNk05iQh98GnHe2orjKdl-ghiZYRF-zzYJrhI6eiC7yIt-t8HhTcrUsOwdZoGui5CVMPh0LwLZQkjonciK0BAOmkwGdQeLTMNVrMu_QPfld0ORvUmM6IpN3eTgEd8jnXejysYGwMfiOe-8pTPniYR9u77_IIj5UbNNV1sWxOS569S00d8dCd5AiN0y5sfS3aV-sjDYew-H5tlMHQtgTsSirJhzZoxpS7E26AX8wp_v3G-fYpDvNn7EeoI8ciRoCteyZasv38njR_jcRlyoBBMyHKNdduIncwztYz2dv3xq0Tm0rcCzgr1eveBYYDmcIG3VtBE5fth1tyEiEvaLxJOt22blW8X2Q9K7p40zdQnTBNEAbOinpf1o0ClDPJBIhZer_8W0at973muV8XNWfcA0LAY52xLtkC-I0C77aD3jP8_mgwwijKPC8pK-RFR2JwqjyHVoYm5vkjNykqSweuZwKHiDe9wiuo8HZZnM30ahc6fJpjrpp0emFCK6L3iJ6YNyvm30BFjp8l2IDwfsU3gB86EzgwqZxVhRFDC25i3L1nbSe-X5B5phHjAFAyifeIchzu62oslVaQNwi60b_huRUCFZ5pRaLIOMcylEeWoWWbvx3BU47APapiHmBchWzw6_Pol9JOa_LgBHIiHMW7r-RmJcLyqUwtm_tgHsIiXjfngiJSxqkwhvbwE8YEfVow5PgoJoD9fUHRtlD3aYKrcmSjFIa8PfwZNwBOXsL4caNFcsZW7LVNT-EPABsx_JN4vrdELptGwP2kt16aaBRyJtbBfXDlr3hP6x8VZxKRxDILao2c9sEJxYJa4SkzhNYFvqQ3xv1Nx8BqKDHwTeqi9i9AmqvDXqmW9pu3JMFn_VgR4z0yxpp_DBRZKk6Qr_PRxENuVL_K8L0QjuVX_Wb52yzV9UGOfYFDdnBgGewAmzz4F5_4ANR4wKkiVcq_W_R-SVEJPmwjMWQqkMsQR9y_CcKYBd7LdE8qdFznampe4fkiRO9yCIJ54MSCyMdpfRGDCdNjSOtchCmboQyT1Ya_fbYisfwd19dRl60fEm0w5du_JSeEsmzSaUYsRQcUenxxDGdr73kWYU1jPsxKU7GHW_SzRNk6IgpexLOOYJojgqTW50bgbGuCiviEXu9QHNq7q8M-rlyuODjlavfZSIG7a_KM0cyCHNBqvU_5T3rXaZtBMv3y4aEFe0S9jHkmg1OEaBSRR2HmEael_-I3HsV0X4Q1fc800OdMmOlEr1SU7YrX7ErHp9KA3_7jx4SzMy4h3jrMbjLTqCFjH-GiZ_haCA4zCfYLvIEpxOPcXV4lUFUgFMgEKUahYIc50xOmp_zDCymY2kKnD4yUcB-PSYSlzZrIqc1dhxV2khm-jlcv9wH8rGPlHHdwhe-YerdpmAZ5nsEyFImR5VnjXQltwnAqKOz_H6cSD5bIaE35peLDdW9SfZXcp0KNiaJAxABRh9nbeIIp0RUL4oUc77qoZDmCRqdkCsYuZ42bAmlzt3N9HqXGyHVH0kkHJNaLjQjz9PbT0zwCLvUZXZ7kENezWWhfZkgUQNrvPZBYQqjIx-IxoFcchjIjZuLH-o03OYj4yTygTA9SVkG_8j9K98f_eTBBKN-GYLmJvmPcOBKPXepure6VdmmBTrD72vrQG2DxmPu6bzkxh9iTjLtBUZjhRuHAvWouRXDo8WNqxlqHfrQ9esyqtajsQ5DebSe4rMum70f6YyA8mHtq5GRFzg1hfmNqLuFD0D9G8OqZd4urTYE0O6BcDNuHGxCNEqB_89CIoQQB2-doFgIyCEYq3ojAerIH-oOWK9ejN-9Dagbj-b-74348zlyJEmSAGiNdShD3X0N3f_UcQ4PXtMnKCY5gWYGR9W8GVsFhG6gUbGSNZprYeDbZt-rtP7hzlrisRLir1cs8MB0U8tHdyhbk636R0vq9w0T_qHIbZ4QlQq9P6OEyyhOfaeGQQQ9jTRt34GxEtqf_-5C_9rYY*\\u000b-13830154332\\u0001q:\xCA\\u000505AAb-fcyDeCNkJZaiP6QXMCrpiTZuh1O6CjWrUD_atia0Jw-w5uwKcon_xddAiHineOuG5-RFUCjd_WeoubIPtlN0wMEtx4UCRD1AulOMLyLwO9-5nW6-XhdbwaY54_H9zw0S585J7y_ZjU4XCGEqZrAShS7D81QgTE5KNwtzcwAZD48_03gCRpYsWCOoSNRNhEx8GGSBahuempwE5kCgDEMWFcl8CE8Y7sH4EnLpsJvPgXmZbssTjWVYLKwZaRkiCQvQe3QLhm4kB2xusWxBG6T4edut8H9E-B53K4v1Www8_aW8RbSMHXwjGzuZiPxDkTShrdJheWFITmblWn5-DqIpEOv9jm2klemRy8abQNKfk7yGY72e6ilZWEJvUqLBnsaev6no0Ef83xi90p1rlLBeT3yMAN74dyq8OqRMX9nn5vLQFfHo3DXN20gex7bPEPKqE7Z62e_DrUETa_BBW7KQOW6rmBhC2UTzpaxxPoKZOJvq9cF4xqglFt8CjOMeLlOgcjBATL-tbsRObH7btJ4OZGFyu6Xxoq7NtLpvbd04diIzbIXDlf7hxg5XSjM94Fkztof21XDLHNeDKzDjWVMjTooZkvyYsXsDNxJGPe0B3jrJDd3iAM_D4oSMKTWVZvSRk8oBw7e7jsJAJoiy_kZIuXf63RsNRypH4lcOpVO0bko4iq3Ok3Ja1HHj0IPdRKb0RFdqB\\u0008homepager(6LeFbcgUAAAAAHQcfuuaFjakmubtKjKCmYM5cbIJ'

        response = requests.post('https://www.google.com/recaptcha/api2/reload', headers=headers, params=params, data=data)

        #NB. Original query string below. It seems impossible to parse and
        #reproduce query strings 100% accurately so the one below is given
        #in case the reproduced version is not "correct".
        # response = requests.post('https://www.google.com/recaptcha/api2/reload?k=6LeFbcgUAAAAAHQcfuuaFjakmubtKjKCmYM5cbIJ', headers=headers, data=data)
#        r = requests.post('https://www.google.com/recaptcha/api2/reload?k=6LeFbcgUAAAAAHQcfuuaFjakmubtKjKCmYM5cbIJ')
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
        url = 'https://codenames.game/room/' + outputJson['game']['name']
        await message.channel.send(url)

client.run(TOKEN)

