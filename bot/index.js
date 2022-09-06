const {
  Client,
  Options,
  GatewayIntentBits,
  ActivityType,
  Partials
} = require("discord.js");
const {
  SlashCommands
} = require("../utils/functions/createSlashCommands/createSlashCommands");
const {
  errorhandler
} = require("../utils/functions/errorhandler/errorhandler");
const {
  spawn
} = require('child_process');
const version = require('../package.json').version;
const config = require('../config.json');
const {
  delay
} = require("../utils/functions/delay/delay");
const {
  getLinesOfCode
} = require("../utils/functions/getLinesOfCode/getLinesOfCode");
const {
  interactionCreate
} = require("./events/interactionCreate");
const { Untis } = require("../utils/functions/untis/untis");
require('dotenv').config()

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  makeCache: Options.cacheWithLimits({
    MessageManager: 10,
    PresenceManager: 10,
    GuildMemberManager: 10
    // Add more class names here
  }),
  shards: 'auto'
});
bot.setMaxListeners(2);

bot.version = version;

SlashCommands();


bot.once('ready', async () => {

  console.time('Fetching guilds and users in:')
  await bot.guilds.fetch().then(async guilds => {
    console.log('Guilds successfully fetched')
    await guilds.forEach(async guild => {
      await bot.guilds.cache.get(guild.id).members.fetch().then(() => {
        console.log('Members successfully fetched')
      })
    });
  })
  console.timeEnd('Fetching guilds and users in:');

  setActivity();
  setInterval(() => {
    setActivity();
  }, 3600000); // 1h

  function setActivity() {
    getLinesOfCode((cb) => {
      var codeLines = ` | Code: ${cb}` || '';
      bot.user.setActivity({
        name: config.activity.name + ' | v' + bot.version + codeLines,
        type: ActivityType.Watching,
      });
      errorhandler({
        err: '------------BOT ACTIVITY SUCCESSFULLY STARTED------------' + new Date(),
        fatal: false
      });
    });
  }

  interactionCreate({
    bot
  })

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server(s)****`);
  errorhandler({
    err: '------------BOT SUCCESSFULLY STARTED------------' + new Date(),
    fatal: false
  });

  const untis = new Untis();

  await untis.setSchoolDates(['mo', 'di']);

  const date = await untis.getDays();

  console.log(await untis.compare());

});

bot.login(process.env.BOT_TOKEN);



process.on('unhandledRejection', async err => {
  errorhandler({
    err,
    fatal: true
  })

  errorhandler({
    err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
    fatal: true
  });


  await delay(5000);
  spawn(process.argv[1], process.argv.slice(2), {
    detached: true,
    stdio: ['ignore', null, null]
  }).unref()
  process.exit()
});

process.on('uncaughtException', async err => {
  errorhandler({
    err: '----BOT CRASHED-----',
    fatal: true
  });
  errorhandler({
    err,
    fatal: true
  })

  await delay(5000);
  spawn(process.argv[1], process.argv.slice(2), {
    detached: true,
    stdio: ['ignore', null, null]
  }).unref()

  errorhandler({
    err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
    fatal: true
  });

  process.exit()
})