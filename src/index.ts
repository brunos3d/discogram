import { TelegramClient } from 'telegram';
import { Api } from 'telegram/tl';
import { StringSession } from 'telegram/sessions';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import prompts from 'prompts';

import config from './config';

const watchlist = ['Test channel', 'Bet and Game', '[ SALA PREMIUM ] - Specialist', 'DS Free 2022', 'CED TIPS FREE'];

(async () => {
  const DISCORD_CLIENT = new Client(config.discord.client);

  await new Promise<void>((resolve) => {
    DISCORD_CLIENT.on('ready', async () => {
      console.log(`[Discord] Logged in as ${DISCORD_CLIENT.user?.tag}!`);
      resolve();
    });

    DISCORD_CLIENT.login(config.discord.token);
  });

  const TELEGRAM_CLIENT = new TelegramClient(new StringSession(config.telegram.sessionToken || ''), config.telegram.apiId, config.telegram.apiHash, {
    connectionRetries: 5,
  });

  await TELEGRAM_CLIENT.start({
    phoneNumber: async () =>
      (
        await prompts({
          type: 'text',
          name: 'value',
          message: 'Please enter your number: ',
        })
      ).value,
    password: async () =>
      (
        await prompts({
          type: 'text',
          name: 'value',
          message: 'Please enter your password: ',
        })
      ).value,
    phoneCode: async () =>
      (
        await prompts({
          type: 'text',
          name: 'value',
          message: 'Please enter the code you received: ',
        })
      ).value,
    onError: (err) => console.log(err),
  });

  console.log(`[Telegram] Logged in!`);

  //   console.log(TELEGRAM_CLIENT.session.save());

  TELEGRAM_CLIENT.addEventHandler(async (event) => {
    if (event?.className !== 'UpdateNewChannelMessage') return;
    if (!event.message.message) return;
    const content = event.message.message;

    // console.log(event.message);
    // console.log(content);

    const channelId = event.message.peerId.channelId;

    const result = await TELEGRAM_CLIENT.invoke(
      new Api.channels.GetFullChannel({
        channel: channelId,
      })
    );

    // console.log(result);

    if (result.chats.length === 0) return;

    const tChannel = result.chats[0];

    if (tChannel.className !== 'Channel') return;
    if (!watchlist.some((w) => tChannel.title.toLowerCase().includes(w.toLowerCase()))) return;

    const dChannel = (await DISCORD_CLIENT.channels.fetch(config.discord.telegramChannelId as string)) as TextChannel;

    if (!dChannel || !dChannel.isText()) return;

    const embed = new MessageEmbed();

    embed.setAuthor(tChannel.title);
    embed.setDescription(content);
    embed.setColor(0x088461);

    const sendedMsg = await dChannel.send({ content: `<@&971194115956047952>`, embed: embed });

    await sendedMsg.react('✅');
    await sendedMsg.react('❌');
  });
})();
