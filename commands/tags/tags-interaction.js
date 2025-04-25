/* 
Some contents of this file were converted from https://github.com/discordjs/discord-utils-bot, which is liscened under the Apache License 2.0, which you can find @ https://www.apache.org/licenses/LICENSE-2.0.txt.

Contents used:
* Autocomplete system (https://github.com/discordjs/discord-utils-bot/blob/main/src/functions/autocomplete/tagAutoComplete.ts)
* Tag system (https://github.com/discordjs/discord-utils-bot/blob/main/src/functions/tag.ts)

Changes:

# Autocomplete
* Converted to d.js;
* Changed emojis;

# Tag system
* Converted to d.js;
* Changed to .json;
* Adjusted FindTag function to include the key and return the whole obj;
* 
*/

const { SlashCommandBuilder, Collection, MessageFlags, EmbedBuilder, subtext, userMention } = require('discord.js');

module.exports = {
    async first() {
        const path = require('node:path');
        const data = await require(path.join(__dirname, "..", "..", "data", "tags.json"))
        global.tagdata = new Collection();
        for (const [key, value] of Object.entries(data)) {
            tagdata.set(key, value)
        }
        console.log('Tags loaded!')
    },
    data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Retrive a tag')
    .addStringOption(option =>
		option.setName('query')
			.setDescription('Phrase to search for')
			.setAutocomplete(true)
            .setRequired(true)
    )
    .addUserOption(option => 
        option.setName('mention')
            .setDescription('User to mention')
    )
    .addBooleanOption(option =>
        option.setName('private')
            .setDescription('Instead of sending the tag to the channel, view the tag privately')
    )
    .addBooleanOption(option =>
        option.setName('view-regex')
            .setDescription('view the regex for this tag for use with !tag')
    ),
    
    async autocomplete(interaction) {
        const input = interaction.options.getFocused();
        const outputlist = [];
        if (input.length) {
            const cleaninput = input.replaceAll(/\s+/g, '-').toLowerCase();
            const namematches = [];
            const flagmatches = [];
            const contentmatches = [];

            for (const [name, tag] of tagdata.entries()) {
                if (name.toLowerCase() === cleaninput) {
                    namematches.push({ name: '✅｜' + name.replaceAll('-', ' '),  value: name })
                } else if (tag.flags.some((text) => text.toLowerCase().includes(cleaninput)) || name.toLowerCase().includes(cleaninput)) {
                    flagmatches.push({ name: '🚩｜' + name.replaceAll('-', ' '),  value: name })
                } else if (tag.content.toLowerCase().includes(cleaninput)) {
                    contentmatches.push({ name: '📃｜' + name.replaceAll('-', ' '),  value: name })
                }
            }
            outputlist.push(...namematches, ...flagmatches, ...contentmatches);
        } else {
            outputlist.push(
                ...tagdata.filter((tag) => tag.pinned)
                .map((_, key) => ({
                    name: '📌｜' + key.replaceAll('-', ' '),
                    value: key,
                })),
            )
        }
        await interaction.respond(outputlist.slice(0, 25))
    },
    FindTag(input) {
        const result = tagdata.get(input) ?? tagdata.find((tag) => tag.flags.includes(input)) ?? null;
        if (result) {
            result.key = input.replaceAll('-', ' ');
        }
        return result;
    },
    async execute(interaction) {
        const tag = this.FindTag(interaction.options.getString('query').trim())
        if (!tag) {
            interaction.reply({content: 'Tag not found, make sure you used an autocomplete!',  flags: MessageFlags.Ephemeral})
        } else {
            tag.content = tag.content.replaceAll('\\n', '\n');
            
            var fetchedmember = await interaction.guild.members.fetch(interaction.user.id)
            const tagEmbed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(tag.content + '\n\n' + subtext(userMention(interaction.member.user.id) + `used the tag "${tag.key}"`))
    
            const payload = {
                content: (interaction.options.getMember('mention') ? interaction.options.getMember('mention').toString() : null),
                embeds: [tagEmbed],
                flags: (interaction.options.getBoolean('test') ? MessageFlags.Ephemeral : null),
            };
            await interaction.reply(payload)
        }
        if (interaction.options.getBoolean('view-regex') == true) {
            const regexembed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(`The regex for this tag (${tag.key}) is:\n\`${tag.regex}\``)
            interaction.followUp({ embeds: [regexembed], flags: MessageFlags.Ephemeral })
        }
    }
};