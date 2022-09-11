const { errorhandler } = require("../errorhandler/errorhandler");
const {Untis} = require("./Untis");

module.exports.watchTimetable = async () => {
  const untis = new Untis();

  const response = await untis.setSchoolDates(['mo', 'di']);
  if(response.error) {
    return errorhandler({
      message: response.message,
      fatal: true
    })
  }

  await untis.setTimetable();

  setInterval(async () => {
    const areDifferent = await untis.compare();

    errorhandler({
      err: areDifferent,
      fatal: true
    })
  }, 86400000); // 24h
}