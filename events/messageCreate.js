const commands = {
    'tags-chat': ['t', 'tag']
}
const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return

        if (!message.guild) return;

        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(" ")

        for (const [name, flags] of Object.entries(commands)) {
            if (flags.includes(args[0].toLowerCase())) {
                message.name = name
                message.args = args
            }
        }

        if (!message.name) return;

        const chatCommand = message.client.commands.get(message.name)

        try {
            console.log(`Executing: ` + message.name)
            await chatCommand.execute(message)
        } catch (error){
            console.error(`failed to execute command: ${message.name} :\n${error}`)
        }
    }
}
