const Discord = module.require("discord.js");


module.exports.run = async (bot, message, args) => {
	let target = message.mentions.users.first();
			if(!target) return message.channel.send("Debes mecionar al usuario del que quieras ver informacion")

			let embed = new Discord.RichEmbed()
				.setAuthor(target.username)
				.setDescription("This is the user's info!")
				.setColor("#9B59B6")
				.addField("Full Username", `${target.username}#${target.discriminator}`)
				.addField("ID", target.id)
				.addField("Created At", target.createdAt)
				.addField("a","Prueba");

			message.channel.send({embed: embed});

}

module.exports.help = {
	name: "userinfo"
}
