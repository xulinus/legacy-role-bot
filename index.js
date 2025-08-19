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

function getRoleFromCommand(msg) {
  return msg.content.split(/\s+/).slice(1).join(" ");
}

function getRoleId(msg, role) {
  const cache = msg.guild.roles.cache
  /*
   * Try to get the role id by either id or name 
   */
  let r = cache.find(r => r.id === role);
  if (!r) {
    r = cache.find(r => r.name.toLowerCase() === role.toLowerCase());
  }

  return r ? r.id : null;
}

function getRoleName(msg, role) {
  const cache = msg.guild.roles.cache
  /*
   * Try to get the role name by either id or name 
   */
  let r = cache.find(r => r.id === role);
  if (!r) {
    r = cache.find(r => r.name.toLowerCase() === role.toLowerCase());
  }

  return r ? r.name : null;
}

/* 
 * msg = msg that triggers the bot 
 * roleId = role to be set 
 * giveRole = boolean, if false do drive run 
 */ 
async function addRoleToAll(msg, roleId, giveRole) {
  const roleObj = msg.guild.roles.cache.find(r => r.id === roleId)
  if (roleObj === undefined) return false;

  let success = true;

  for (const member of msg.guild.members.cache.values()) {
    console.log(`Adding [${roleObj.name}] role to: ${member.user.username} [${member.user.id}]`);
    if (giveRole) {
      try {
        await member.roles.add(roleObj.id);
      } catch (err) {
        console.error(err);
        success = false;
      }
    }
  }
  
  return success;
}

async function addRoleToAllCommand(msg, role, giveRole) {
  // make sure that role exists, and get the role id 
  roleId = getRoleId(msg, role);

  if(roleId) {
    roleName = getRoleName(msg, roleId);
    
    if (await addRoleToAll(msg, roleId, giveRole)) {
      if (giveRole) msg.channel.send(`Finnished adding the role [${roleName}] to all server members.`);
      if (!giveRole) msg.channel.send(`DRY RUN: Finnished adding the role [${roleName}] to all server members.`);
      return
    };
  }
  
  msg.channel.send(`Something went wrong, failed to add role. Make sure that [${role}] is a role.`)
}

/* 
 * msg = msg that triggers the bot 
 * roleId = role to be set 
 * giveRole = boolean, if false do drive run 
 */ 
async function removeRoleFromAll(msg, roleId, removeRole) {
  const roleObj = msg.guild.roles.cache.find(r => r.id === roleId)
  if (roleObj === undefined) return false;

  let success = true;

  for (const member of msg.guild.members.cache.values()) {
    console.log(`Removing [${roleObj.name}] role from: ${member.user.username} [${member.user.id}]`);
    if (removeRole) {
      try {
        await member.roles.remove(roleObj.id);
      } catch (err) {
        console.error(err);
        success = false;
      }
    }
  }
  
  return success;
}

async function removeRoleFromAllCommand(msg, role, removeRole) {
  // make sure that role exists, and get the role id 
  roleId = getRoleId(msg, role);
  
  if (roleId) {
    roleName = getRoleName(msg, roleId);
    if (await removeRoleFromAll(msg, roleId, removeRole)) {
      if (removeRole) msg.channel.send("Finnished removing role from all server members.");
      if (!removeRole) msg.channel.send("DRY RUN: Finnished removing role from all server members.");
      return
    };
  }

  msg.channel.send(`Something went wrong, failed to remove role. Make sure that [${role}] is a role.`)
}

client.login(process.env.BOT_TOKEN).catch(err => {
  console.error(err);
  process.exit();
});

client.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  if (userIsMod(msg) && msg.content.split(/\s+/)[0].toLowerCase() == "!addrole") {
    role = getRoleFromCommand(msg); 
    await addRoleToAllCommand(msg, role, true);
  }

  //dry run
  if (userIsMod(msg) && msg.content.split(/\s+/)[0].toLowerCase() == "!dryaddrole") {
    role = getRoleFromCommand(msg); 
    await addRoleToAllCommand(msg, role, false);
  }

  if (userIsMod(msg) && msg.content.split(/\s+/)[0].toLowerCase() == "!removerole") {
    role = getRoleFromCommand(msg); 
    await removeRoleFromAllCommand(msg, role, true);
  }

  //dry run
  if (userIsMod(msg) && msg.content.split(/\s+/)[0].toLowerCase() == "!dryremoverole") {
    role = getRoleFromCommand(msg); 
    await removeRoleFromAllCommand(msg, role, false);
  }

})

process.on("exit",  () => {
  console.log('destroying bot client');
  client.destroy();
});
