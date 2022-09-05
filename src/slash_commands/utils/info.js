const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

module.exports.run = async ({main_interaction, bot}) => {
try {
    await main_interaction.deferReply();

    function convertDateToDiscordTimestamp(date) {
        let converteDate = new Intl.DateTimeFormat('de-DE').format(date)
        converteDate = converteDate.split('.');
        converteDate = new Date(converteDate[2], converteDate[1] - 1, converteDate[0]);

        return Math.floor(converteDate/1000);
    }

    function format(seconds){
        function pad(s){
          return (s < 10 ? '0' : '') + s;
        }
        var hours = Math.floor(seconds / (60*60));
        var minutes = Math.floor(seconds % (60*60) / 60);
        var seconds = Math.floor(seconds % 60);
      
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      }
      
      var uptime = process.uptime();

      let server = main_interaction.guild;
    
    const serverInfoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`**Serverinfos - ${server.name}**`)
        .setURL('https://github.com/Mittelbots/Untis-Discord-Bot')
        .setThumbnail(server.iconURL())
        .setDescription(`${server.id}`)
        .addFields([
            {name: `Owner: `, value:`<@${server.ownerId}>`, inline: true},
            {name: `Channels`, value: `${server.channels.cache.size}`, inline: true},
            {name: `Members`, value: `${server.members.cache.size}`, inline: true},
            {name: `Roles`, value: `${server.roles.cache.size}`, inline: true},
            {name: `Created`, value: `${new Intl.DateTimeFormat('de-DE').format(server.createdAt)} \n<t:${convertDateToDiscordTimestamp(server.createdAt)}:R>`, inline: true},
            {name: `Uptime`, value: `${format(uptime)}`, inline: true},
            {name: `Version`, value: `${bot.version}`, inline: true},
            {name: '\u200B', value: '\u200B'}
        ])
        .setTimestamp();
    
    return main_interaction.followUp({
        embeds: [serverInfoEmbed],
    }).catch(err => {
        return errorhandler(err, config.errormessages.nopermissions.sendEmbedMessages, main_interaction.channel, log, config);
    });
}catch(err) {
    console.log(err)
}
}

module.exports.data = new SlashCommandBuilder()
	.setName('info')
	.setDescription('Get information about yourself or another user')