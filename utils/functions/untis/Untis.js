const WebUntis = require('webuntis');
const {errorhandler} = require('../errorhandler/errorhandler');

class Untis {
    #untis;

    #schoolDates = [];

    #timetable = {};

    constructor() {
        if (!this.#untis) {
            try {
                this.#untis = new WebUntis.WebUntisSecretAuth(process.env.UNTIS_SCHOOL, process.env.UNTIS_USERNAME, process.env.UNTIS_SECRET, process.env.UNTIS_URL)
            }catch(err) {
                errorhandler({
                    err
                })
            }
        }
    }

    /**
     * Set the short version of all school days (E.g. mo, di, ...)
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

    async setTimetable() {

        if (this.#schoolDates.length == 0) {
            return {
                error: true,
                message: 'You doesnt have set any school dates. Please do this first to continue.'
            }
        }

        for (let i in this.#schoolDates) {
            let schoolDay = this.#schoolDates[i];
            let dayInt = this.#getDayInt(schoolDay);

            if (dayInt) {
                let temp_obj = {};

                let future_date = this.#getFutureDate(dayInt);
                
                temp_obj.date = future_date;

                temp_obj.data = {};

                let timetables = await this.getTimetable(future_date);

                if(timetables.length === 0) {
                    temp_obj.data[0] = 'FREE';
                }else {
                    timetables.map(tt => {
                        temp_obj.data[tt.id] = tt;
                    });
                }

                this.#timetable[schoolDay] = temp_obj;
            }
        }

        }

    #getFutureDate(dayInt) {
        return new Date().setDate(new Date().getDate() + (((1 + dayInt - new Date().getDay()) % dayInt) || dayInt));
    }

    /**
     * Returns a Integer for each day
     * @param {String} day 
     * @returns {Int} 
     */
    #getDayInt(day) {
        switch (day) {
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
        return await this.#untis.login()
        .then(() => {
            return this.#untis.getClasses();
        })
        .then(async (classes) => {
            return await this.#untis.getTimetableForToday(process.env.UNTIS_CLASS_ID, WebUntis.TYPES.CLASS);
        })
        .catch(err => {
            errorhandler({err})
        })
    }

    async compare() {
        if (this.#schoolDates.length == 0) return false;

        let result = {};

        for (let i in this.#schoolDates) {

            let dayInt = this.#getDayInt(this.#schoolDates[i]);
            let future_date = this.#getFutureDate(dayInt);

            const today = new Date().getTime();
            if(today !== future_date) continue;

            const newTimetable = await this.getTimetable(future_date);
            const oldTimetable = this.#timetable[this.#schoolDates[i]];

            let oldData = oldTimetable.data;
            let newData = newTimetable;
    
            let oldTable = {};

            for(let i in oldData) {
                if(oldData[i] === 'FREE') {
                    future_date = 'FREE'
                    continue;
                }
                oldTable[oldData[i].id] = oldData[i];
            }
            
            let newTable = {};

            newData.map((data, index) => {
                if(data.length === 0) {
                    future_date = 'FREE'
                    return;
                }
                newTable[data.id]= data;
            });

            if(future_date === 'FREE') continue;

            for(let d in oldTable) {

                if(oldTable[d].id === newTable[d].id) {
                    let isDiff = JSON.stringify(oldTable[d]) !== JSON.stringify(oldTable[d]);
                    //if(isDiff) {
                        let obj = {};

                        let old_data = oldTable[d];
                        let new_data = newTable[d];

                        new_data.startTime = 'res';

                        if(old_data.startTime !== new_data.startTime) {
                            obj.startTime = {
                                new: new_data.startTime,
                                old: old_data.startTime
                            }
                        }

                        if(old_data.endTime !== new_data.endTime) {
                            obj.endTime = {
                                new: new_data.endTime,
                                old: old_data.endTime
                            }
                        }

                        if(JSON.stringify(old_data.kl) !== JSON.stringify(new_data.kl)) {
                            obj.kl = {
                                new: new_data.kl,
                                old: old_data.kl,
                                whatChanged: []
                            }
                            for(let k in old_data.kl) {
                                if(old_data[k] !== new_data[k]) {
                                    obj.whatChanged.push(k);
                                }
                            }
                        }

                        if(JSON.stringify(old_data.te) !== JSON.stringify(new_data.te)) {
                            obj.te = {
                                new: new_data.te,
                                old: old_data.te,
                                whatChanged: []
                            }
                            for(let t in old_data.te) {
                                if(old_data[t] !== new_data[t]) {
                                    obj.whatChanged.push(t);
                                }
                            }
                        }


                        if(JSON.stringify(old_data.su) !== JSON.stringify(new_data.su)) {
                            obj.su = {
                                new: new_data.su,
                                old: old_data.su,
                                whatChanged: []
                            }
                            for(let s in old_data.su) {
                                if(old_data[s] !== new_data[s]) {
                                    obj.whatChanged.push(s);
                                }
                            }
                        }

                        if(JSON.stringify(old_data.ro) !== JSON.stringify(new_data.ro)) {
                            obj.ro = {
                                new: new_data.ro,
                                old: old_data.ro,
                                whatChanged: []
                            }
                            for(let r in old_data.ro) {
                                if(old_data[r] !== new_data[r]) {
                                    obj.whatChanged.push(r);
                                }
                            }
                        }

                        if(old_data.lsnumber !== new_data.lsnumber) {
                            obj.lsnumber = {
                                new: new_data.lsnumber,
                                old: old_data.lsnumber
                            }
                        }

                        if(old_data.sg !== new_data.sg) {
                            obj.sg = {
                                new: new_data.sg,
                                old: old_data.sg
                            }
                        }

                        if(old_data.activityType !== new_data.activityType) {
                            obj.activityType = {
                                new: new_data.activityType,
                                old: old_data.activityType
                            }
                        }

                        result[this.#schoolDates[i]] = obj;
                    //}
                }
            }
        }

        return result;
    }

    #isDifferent(obj) {
        let isDiff = false;
        for(let i in obj) {
            if(obj.length === 0) continue;

            return isDiff = true;
        }
        return isDiff
    }
}

module.exports = {
    Untis
}