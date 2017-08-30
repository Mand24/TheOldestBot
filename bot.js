const botSettings = require("./botSettings.json");
const Discord = require("discord.js");
const fs = require("fs");
const prefix = botSettings.prefix;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
	if(err) console.error(err);

	let jsfiles = files.filter(f => f.split(".").pop() === "js");
	if(jsfiles.length <= 0) 
	{
		console.log("No commands to load");
		return;
	}

	console.log(`Loading ${jsfiles.length} commands!`);

	jsfiles.forEach((f, i ) => {

		let props = require(`./cmds/${f}`)
		console.log(`${i + 1}: ${f} loaded!`);
		bot.commands.set(f, props);

	});
});

bot.on("ready", async () => {

	console.log(`Bot is ready! ${bot.user.username}`);
	console.log(bot.commands);
});

bot.on("message", async message => {

	let guild_id = (message.guild.id);

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	let messageArray = message.content.split(" ");
	let command = messageArray[0];
	let args = messageArray.slice(1);
	let role;

	if(!command.startsWith(prefix)) return;

	let cmd = bot.commands.get(command.slice(prefix.length));
	if(cmd) cmd.run(bot, message, args);

	switch (command) 
	{

		case `${prefix}userinfo` :

			let target = message.mentions.users.first();
			if(!target) return message.channel.send("Debes mecionar al usuario del que quieras ver informacion")

			let embed = new Discord.RichEmbed()
				.setAuthor(target.username)
				.setDescription("This is the user's info!")
				.setColor("#9B59B6")
				.addField("Full Username", `${target.username}#${target.discriminator}`)
				.addField("ID", target.id)
				.addField("Created At", target.createdAt);

			message.channel.send({embed: embed});

		break;
	
		case `${prefix}mute` :

			//Get the mentioned user, return if there is none or himself
			let toMute = message.guild.member(message.mentions.users.first());
			if(!toMute) return message.channel.send("You did not specify a valid user mention!");
			if(toMute == message.member) return message.channel.send("You cannot mute yourself.");

			//Check if command executor has the right permission to do this command
			if(!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have the manage_messages permission.");

			//If the muted has the same or higher role than the muter, return
			if(message.guild.member(message.author).highestRole.position <= toMute.highestRole.position) return message.channel.sendMessage("You cannot mute a higher or equal member.")

			role = null;
			role = message.guild.roles.find(r => r.name === "muted");

			if(!role) {

				try {

					role = await message.guild.createRole({
						name: 'muted',
						color: '#000000',
						permissions: [],
						position: 1
						});

					message.guild.channels.forEach(async (channel, id) => {
						await channel.overwritePermissions(role, {
							SEND_MESSAGES: false,
							ADD_REACTIONS: false
							});
					});

				} catch(e) {
					console.log(e.stack);
				}
			}

			if(toMute.roles.has(role.id)) return message.channel.send("This user is already muted!");
			await toMute.addRole(role);
			message.channel.send("I have muted this person");

		break;

		case `${prefix}unmute` :

			let toUnmute = message.guild.member(message.mentions.users.first());
			if(!toUnmute) return message.channel.send("You did not specify a valid user mention!");
			if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have the manage_messages permission.");
			if(message.member.highestRole.position <= toUnmute.highestRole.position) return message.channel.send("You cannot Unmute a higher or equal member.");

			role = null;
			role = message.guild.roles.find(r => r.name === "muted");

			if(!role) {

				try {

					role = await message.guild.createRole({
						name: 'muted',
						color: '#000000',
						permissions: [],
						position: 1
						});

					message.guild.channels.forEach(async (channel, id) => {
						await channel.overwritePermissions(role, {
							SEND_MESSAGES: false,
							ADD_REACTIONS: false
							});
					});

				} catch(e) {
					console.log(e.stack);
				}
			}

			if(!toUnmute.roles.has(role.id)) return message.channel.send("This user is not muted!");
			await toUnmute.removeRole(role);
			message.channel.send("I have unmuted this person");

		break;




	}

});

bot.login(botSettings.token);