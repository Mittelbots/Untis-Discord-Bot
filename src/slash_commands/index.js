module.exports.handleSlashCommands = async ({
    main_interaction,
    bot
}) => {
    let utils = ['info'];

    //=========================================================
    if (utils.indexOf(main_interaction.commandName) !== -1) {
        return require(`./utils/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot
        });
    }
    else {
        return require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot
        });
    }
}