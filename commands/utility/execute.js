const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { ownerId } = require('../../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('execute')
		.setDescription('[dev] execute js code')
		.addStringOption(option =>
			option.setName('code')
				.setDescription('Code to execute')
				.setRequired(true)
		),
	async execute(interaction) {
		if (interaction.member.id !== ownerId) {
			console.log(`${interaction.member.id} (${interaction.member.user.username}) attemped to execute code`);
			interaction.reply({content: 'You are not allowed to run this command.', flags: MessageFlags.Ephemeral});
			return
		};

		eval(interaction.options.getString('code'))

		interaction.reply({content: 'Executed.', flags: MessageFlags.Ephemeral});
	},
};