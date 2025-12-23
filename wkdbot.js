// WKD BOT - Discord.js (Node.js) version
// Requirements: Node 16.9+ and discord.js v14
// Install: npm init -y && npm install discord.js@14
// Usage: set environment variables DISCORD_TOKEN and OWNER_ID, then run: node wkdbot.js
require('dotenv').config();

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const prefix = '$';

// Verboden woorden (lowercase)
const forbiddenWords = [
  'kkr', 'fuck', 'neger', 'nigger', 'kut', 'kanker',
  'k a n k e r', 'f u c k', 'k k r',
  'n e g e r', 'n i g g e r',
  'k u t', 'roetpiet', 'r o e t p i e t',
  'saai', 's a a i', '67'
];

client.once('ready', () => {
  console.log(`WKD BOT is online als ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const text = message.content.toLowerCase();

  if (forbiddenWords.some(word => text.includes(word))) {
    try {
      await message.reply(
        'WKD vindt dat niet leuk ga je er mee stoppen anders gaan we je dissen kleintje ik heb nog groter bestaan dan je toekomst'
      );
    } catch (err) {
      console.error('Kon niet reageren op bericht:', err);
    }
    return;
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // -----------------------------------
  // CLEAR COMMAND
  // -----------------------------------
  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('Je hebt geen permissie om berichten te verwijderen.');
    }

    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount <= 0) return message.reply('Gebruik: $clear <aantal>');

    try {
      // bulkDelete can only delete up to 100 at once and only messages younger than 14 days
      await message.channel.bulkDelete(amount, true);
      await message.channel.send(`Heb ${amount} berichten verwijderd.`).then(msg => setTimeout(() => msg.delete().catch(()=>{}), 5000));
    } catch (err) {
      console.error(err);
      message.reply('Kon berichten niet verwijderen. Zorg dat ze jonger dan 14 dagen zijn en dat ik de juiste permissies heb.');
    }
  }

  // -----------------------------------
  // WARN COMMAND
  // -----------------------------------
  if (command === 'warn') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('Je hebt geen permissie om leden te waarschuwen.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('Geen geldig lid opgegeven. Gebruik: $warn @lid');

    try {
      await member.send('Je bent gewaarschuwd je lijkt wel op dolfje weerwolfje.');
    } catch (err) {
      // DM kan mislukken als gebruiker DMs heeft uitgeschakeld
    }

    message.channel.send(`${member} is gewaarschuwd.`);
  }

  // -----------------------------------
  // KICK COMMAND
  // -----------------------------------
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('Je hebt geen permissie om leden te kicken.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('Geen geldig lid opgegeven. Gebruik: $kick @lid');

    try {
      await member.kick();
      message.channel.send(`${member.user.username} is gekickt.`);
    } catch (err) {
      console.error(err);
      message.reply('Kon het lid niet kicken. Zorg dat ik voldoende permissies heb.');
    }
  }

  // -----------------------------------
  // BAN COMMAND
  // -----------------------------------
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('Je hebt geen permissie om leden te verbannen.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('Geen geldig lid opgegeven. Gebruik: $ban @lid');

    try {
      await member.ban();
      message.channel.send(`${member.user.username} is verbannen.`);
    } catch (err) {
      console.error(err);
      message.reply('Kon het lid niet verbannen. Zorg dat ik voldoende permissies heb.');
    }
  }

  // -----------------------------------
  // TIMEOUT COMMAND
  // -----------------------------------
  if (command === 'timeout') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('Je hebt geen permissie om leden te timen-outten.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const secondsArg = args[1] || args[0]; // allow both $timeout @user seconds or $timeout user seconds
    const seconds = parseInt(secondsArg, 10);

    if (!member || isNaN(seconds) || seconds <= 0) return message.reply('Gebruik: $timeout @lid <seconden>');

    try {
      await member.timeout(seconds * 1000);
      message.channel.send(`${member.user.username} is getime-out voor ${seconds} seconden.`);
    } catch (err) {
      console.error(err);
      message.reply('Kon het lid niet timen-outten. Zorg dat ik voldoende permissies heb.');
    }
  }

  // -----------------------------------
  // STOP COMMAND
  // -----------------------------------
  if (command === 'stop') {
    const ownerId = process.env.OWNER_ID || null; // set OWNER_ID env var to restrict who can stop the bot
    if (!ownerId) return message.reply('Stop-commando niet geconfigureerd. Stel OWNER_ID in.');
    if (message.author.id !== ownerId) return message.reply('Alleen de eigenaar kan dit commando gebruiken.');

    message.channel.send('WKD BOT gaat uit... 👋').then(() => {
      client.destroy();
      process.exit(0);
    });
  }
});

// -----------------------------------
// RUN
// -----------------------------------
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Fout: je moet DISCORD_TOKEN als environment variable zetten.');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('Login mislukt:', err);
});
