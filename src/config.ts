import { ClientOptions, Intents } from 'discord.js';

export default {
  discord: {
    token: process.env.DISCORD_TOKEN as string,
    telegramChannelId: process.env.DISCORD_TELEGRAM_CHANNEL_ID as string,
    client: {
      ws: { intents: Intents.ALL },
    } as ClientOptions,
  },
  telegram: {
    sessionToken: process.env.TELEGRAM_SESSION_TOKEN,
    apiId: +(process.env.TELEGRAM_API_ID as string),
    apiHash: process.env.TELEGRAM_API_HASH as string,
  },
};
