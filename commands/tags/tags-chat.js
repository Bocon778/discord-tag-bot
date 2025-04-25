const { EmbedBuilder, subtext, userMention, heading } = require('discord.js');

module.exports = {
    data: {name: 'tags-chat', type: 'message'},
    async execute(message) {
        const fetchedmember = await message.guild.members.fetch(message.member.user.id)
        if (message.args[1] == undefined) {
            const fetchedemoji = await message.client.application.emojis.fetch('1361915029578055701')
            const embed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(`${heading(fetchedemoji.toString() + ' Missing parameter', 2)}\nYou need to specify regex to use.`)
            message.reply({ embeds : [embed]})
            return;
        }
        for (const [name, tag] of tagdata.entries()) {
            const regex = new RegExp(tag.regex, 'i');
            if (regex.test(message.args.join(' '))) {
                var tagname = name;
                break
            }
        }
        if (tagname) {
            const embed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(tagdata.get(tagname).content.replaceAll('\\n', '\n') +  '\n\n' + subtext(userMention(message.member.user.id) + ` used the tag "${tagname.replaceAll('-', ' ')}"`))
            try {
                var referencedMessage = await message.fetchReference();
            } catch {
                var referencedMessage = null;
            }
            if (referencedMessage) {
                referencedMessage.reply({ embeds : [embed]});
                message.delete();
            } else {
                const fetchedChannel = await message.client.channels.fetch(message.channel.id);
                fetchedChannel.send({ embeds : [embed]})
                const cleancontent = message.content.toLowerCase();
                if (cleancontent.includes('del') || cleancontent.includes('-'))
                    message.delete();
            }
        } else {
            const fetchedemoji = await message.client.application.emojis.fetch('1361915029578055701')
            const embed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(`${heading(fetchedemoji.toString() + ' Tag not found', 2)}\nYou entered '${message.args.slice(message.args[0].length).join(' ')}', which was not found in the database.`)
            try {
                const botreply = await message.reply({ embeds : [embed]})
                setTimeout(() => {
                    botreply.delete()
                }, 15000)
            } catch (error){
                console.error(`Failed to delete message: ${error} (MessageID: ${message.id})`)
            }
        }
    }
}