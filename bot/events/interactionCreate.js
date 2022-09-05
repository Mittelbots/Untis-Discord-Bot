const {
    handleSlashCommands
} = require("../../src/slash_commands");
const {
    InteractionType
} = require("discord.js");

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {

        if (main_interaction.user.bot || main_interaction.user.system) return;

        main_interaction.bot = bot;
        if (main_interaction.type === InteractionType.ApplicationCommand) {
            return handleSlashCommands({
                main_interaction,
                bot
            });
        }
    });
}