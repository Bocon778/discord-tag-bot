const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) {
			console.log(`Unhandled interaction: ${interaction.commandName}`);
			return;
		} else {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				if (interaction.isChatInputCommand()) {
					console.log(`Executing: ${interaction.commandName}`);
					await command.execute(interaction);
				} else {
					console.log(`Autocompleting for: ${interaction.commandName}`);
					await command.autocomplete(interaction)
				}
			} catch (error) {
				console.error(error);
				if (!interaction.isChatInputCommand()) {return};
				
				if (interaction.replied || interaction.deferred)
					await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				else
					await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};
