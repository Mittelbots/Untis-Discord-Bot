const WebUntis = require('webuntis');

class Untis {
    #untis;
    #currentDate = new Date();

    #schoolDates = [];

    #timetable;

    constructor() {
        if (!this.#untis) {
            this.#untis = new WebUntis.WebUntisSecretAuth(process.env.UNTIS_SCHOOL, process.env.UNTIS_USERNAME, process.env.UNTIS_SECRET, process.env.UNTIS_URL);
        }
    }

    /**
     * 
     * @param {Array} days 
     * @returns 
     */
    async setSchoolDates(days) {
        if (!days || days.length == 0) {
            return {
                error: true,
                message: "Days array is required or has to be more then one entry"
            }
        }

        if (!Array.isArray(days)) {
            return {
                error: true,
                message: "Your passed data is not an array."
            }
        }

        this.#schoolDates = days;

        return {
            error: false
        }
    }

    async getDays() {
        let response = {};

        if (this.#schoolDates.length == 0) {
            return {
                error: true,
                message: 'You doesnt have set any school dates. Please do this first to continue.'
            }
        }

        for (let i in this.#schoolDates) {

            let dayInt = this.#getDayInt(i);

            if (dayInt) {
                let obj = {}
                
                obj.date = this.#getFutureDate(dayInt);
                obj.data = {}
                
                const timetable = await this.getTimetable(obj.date);

                timetable.map(tt => {
                    obj.data[tt.id] = tt;
                })

                response[this.#schoolDates[i]] = obj;
            }
        }
        this.#timetable = response;
        return response;
    }

    #getFutureDate(dayInt) {
        return new Date().setDate(this.#currentDate.getDate() + (((1 + dayInt - this.#currentDate.getDay()) % dayInt) || dayInt));
    }

    #getDayInt(index) {
        switch (this.#schoolDates[index]) {
            case 'mo':
                return 7
            case 'di':
                return 8
            case 'mi':
                return 9
            case 'do':
                return 10
            case 'fr':
                return 11
            case 'sa':
                return 12
            case 'so':
                return 13
            default:
                return null
        }
    }

    async getTimetable(date) {
        return await this.#untis
        .login()
        .then(async () => {
            return this.#untis.getOwnTimetableForWeek(new Date(date));
        })
        .then((timetable) => {
            return timetable;
        });
    }

    async compare() {
        if (this.#schoolDates.length == 0) return false;
        
        for(let i in this.#schoolDates) {
            let dayInt = this.#getDayInt(this.#schoolDates[i]);
            const newTimetable = await this.getTimetable(this.#getFutureDate(dayInt));
            const oldTimetable = this.#timetable;

            if(JSON.stringify(newTimetable) === JSON.stringify(oldTimetable)) {
                console.log('is equal');
            }else {
                console.log('its not')
            }
        }
    }
}

module.exports = {
    Untis
}

