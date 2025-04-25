const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
]});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands'); // ./commands
const commandFolders = fs.readdirSync(foldersPath); // ./commands/*

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder); // ./command/*/
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // list of all @ ./commands/*/*.js
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file); // ./commands/*/*.js
		const command = require(filePath); // import file contents
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command); // add as a command
			if ('first' in command)
				command.first();
		} else {
			console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`); // otherwise warn
		}
	}
}
console.log('Commands loaded!')

// log events to listen for
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once)
		client.once(event.name, (...args) => event.execute(...args));
	else
		client.on(event.name, (...args) => event.execute(...args));
}

client.login(token);
