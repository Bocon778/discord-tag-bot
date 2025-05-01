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

const { SlashCommandBuilder,
    Collection,
    MessageFlags,
    EmbedBuilder,
    subtext,
    userMention,
    inlineCode,
    heading,
    HeadingLevel,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorSpacingSize,
    quote,
    chatInputApplicationCommandMention } = require('discord.js');

const fs = require('fs').promises;
const path = require('node:path');
const datapath = path.join(__dirname, "..", "..", "data", "tags.json");

module.exports = {
    async first() {
        const data = await require(datapath);
        tagdata = new Collection();
        for (const [key, value] of Object.entries(data)) {
            tagdata.set(key, value)
        }
        this.tagdata = tagdata;
    },
    data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Retrive a tag')
    .addStringOption(option =>
		option.setName('query')
			.setDescription('Phrase to search for')
			.setAutocomplete(true)
            .setRequired(true))
    .addUserOption(option => 
        option.setName('mention')
            .setDescription('User to mention'))
    .addBooleanOption(option =>
        option.setName('private')
            .setDescription('Instead of sending the tag to the channel, view the tag privately'))
    .addBooleanOption(option =>
        option.setName('view-info')
            .setDescription('view various information about the tag, including regex, flags, content, and usage statistics')),
    
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
            result.key = input;
        }
        return result;
    },
    ReloadTagdata(){
        this.tagdata.clear();
        this.first()
    },
    // get the ranking of a tag using its key
    GetTagRanking(tagkey) {
        const ranking = new Collection();
        for (const [tagname, tagobj] of tagdata.entries()) {
            if (ranking.has(tagobj.uses))
                ranking.set(tagobj.uses, ranking.get(tagobj.uses).concat(tagname));
            else
                ranking.set(tagobj.uses, [tagname]);
        }
        ranking.sort((x, y) => y - x); // sort by uses descending
        let actualRank = 0;
        for (const [rank, tags] of ranking.entries()) {
            actualRank++;
            if (tags.includes(tagkey)) {
                return actualRank;
            }
        }
        return null;
    },
    IncreaseTagUsage(tagkey) {
        fs.readFile(datapath)
        .then(body => JSON.parse(body))
            .then(json => {
            json[tagkey].uses = json[tagkey].uses + 1;
            return json
        })
        .then(json => JSON.stringify(json, null, 2))
        .then(body => fs.writeFile(datapath, body))
        .then(this.ReloadTagdata())
        .catch(error => console.log(error))
    },
    async execute(interaction) {
        const tag = this.FindTag(interaction.options.getString('query').trim())
        if (!tag)
            return await interaction.reply({content: 'Tag not found, make sure you used an autocomplete!',  flags: MessageFlags.Ephemeral})

        const fetchedmember = await interaction.guild.members.fetch(interaction.user.id)
        // tag info
        if (interaction.options.getBoolean('view-info') == true) {
            const taginfo = new ContainerBuilder();
            taginfo.setAccentColor(fetchedmember.displayColor || 0x5C146C);
            tag.ranking = this.GetTagRanking(tag.key);

            overview = new TextDisplayBuilder().setContent(
                [
                    heading(tag.key.replaceAll('-', ' ')),
                    heading(`🚩 Flags (${chatInputApplicationCommandMention('tag', '1361918316423413832')})`, HeadingLevel.Three),
                    quote(inlineCode(tag.flags.join(', '))),
                    heading(`🏁 Regex (${inlineCode('!tag')})`, HeadingLevel.Three),
                    quote(inlineCode(tag.regex.replaceAll('-', ' ')))
                ].join('\n')
            );
            taginfo.addTextDisplayComponents(overview);

            taginfo.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Large))

            const tagcontent = new TextDisplayBuilder().setContent(
                [
                    heading('Content', HeadingLevel.Two),
                    tag.content.replaceAll('\\n', '\n')
                ].join('\n')
            )

            taginfo.addTextDisplayComponents(tagcontent);

            taginfo.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))

            const tagusage = new TextDisplayBuilder().setContent(
                [
                    heading('Usage', HeadingLevel.Two),
                    `This tag has been used ${tag.uses ?? 'unknown'} times, which makes it the #${tag.ranking ?? '?'} most used tag.`,
                ].join('\n')
            )

            taginfo.addTextDisplayComponents(tagusage);

            await interaction.reply({ components: [taginfo], flags: MessageFlags.Ephemeral+MessageFlags.IsComponentsV2 });
        } else {
            // tag
            tag.content = tag.content.replaceAll('\\n', '\n');
            
            const tagEmbed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(tag.content + '\n\n' + subtext(userMention(interaction.member.user.id) + `used the tag "${tag.key.replaceAll('-', ' ')}"`))
    
            const payload = {
                content: (interaction.options.getMember('mention') ? interaction.options.getMember('mention').toString() : null),
                embeds: [tagEmbed],
                flags: (interaction.options.getBoolean('private') ? MessageFlags.Ephemeral : null),
            };
            await interaction.reply(payload);
            this.IncreaseTagUsage(tag.key);
        }
    }
};
