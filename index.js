const { Client, GatewayIntentBits, messageLink, Partials } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel] });

require('dotenv').config();

const SERVER_ID = process.env.SERVER_ID;
const LEGACY_ROLE_ID = process.env.LEGACY_ROLE_ID;

function userIsMod(msg){
    return msg.member.roles.cache.find(r => r.name === "MOD")
}

client.login(process.env.BOT_TOKEN).catch(err => {
  console.error(err);
  process.exit();
});

client.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  if (userIsMod(msg) && msg.content.split(" ")[0].toLowerCase() == "!addlegacyrole") {
    const guild = client.guilds.cache.get(SERVER_ID);
    guild.members.cache.forEach(member => {
      console.log(`Adding legacy role to: ${member.user.username} [${member.user.id}]`)
      member.roles.add(LEGACY_ROLE_ID).catch(console.error);
    });

    msg.channel.send("Finnished adding the legacy role to all server members.");
  }
})

process.on("exit",  () => {
  console.log('destroying bot client');
  client.destroy();
});
