const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const path = require('node:path');
const tags = require(path.join(__dirname, "tags-interaction.js")); // import reload method from interaction functionality

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tags-reload')
        .setDescription('Reload tags from database'),
    async execute(interaction) {
        tags.ReloadTagdata()
        const fetchedmember = await interaction.guild.members.fetch(interaction.user.id)
        const embed = new EmbedBuilder()
            .setColor(fetchedmember.displayColor || 0x5C146C)
            .setDescription(`Success! Reloaded tags from database.\n\nThere are currently ${tags.tagdata.size} tags loaded.`)
        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral})
    }
}
