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

  setTimeout(async () => {
    const areDifferent = await untis.compare();

    console.log(areDifferent, 'diff');
  }, 2000);
}