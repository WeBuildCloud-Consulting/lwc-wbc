import { LightningElement, api, track } from 'lwc';
import momentdir from '@salesforce/resourceUrl/moment';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

var today;
export default class DatePicker extends LightningElement {
    lastClass;
    @track dateContext;
    @track selectedDate;
    @track dates = [];
    datepickerInitialized = false;

    constructor(){
        super();
        if(this.datepickerInitialized){
            return;
        }
        this.datepickerInitialized = true;

        Promise.all([
            loadScript(this, momentdir)
        ]).then(() => {
           today = moment();//moment().format();
           this.dateContext = moment();
           this.selectedDate = moment();
           this.refreshDateNodes();

        })
        .catch(error => {
            debugger;
        });
    }

    get formattedSelectedDate() {
        if(this.selectedDate){
            return this.selectedDate.format('YYYY-MM-DD');
        }
        return  'YYYY-MM-DD';
        
    }
    get year() {
        if(this.dateContext){
            return this.dateContext.format('Y');
        }
        return 'Y';
    }
    get month() {
        if(this.dateContext){
            return this.dateContext.format('MMMM');
        }
        return 'MMMM';
    }

    previousMonth() {
        this.dateContext = moment(this.dateContext).subtract(1, 'month');
        this.refreshDateNodes();
    }

    nextMonth() {
        this.dateContext = moment(this.dateContext).add(1, 'month');
        this.refreshDateNodes();
    }

    goToday() {
        this.selectedDate = today;
        this.dateContext = today;
        this.refreshDateNodes();
    }

    @api
    setSelected(e) {
        const selectedDate = this.template.querySelector('.selected');
        if (selectedDate) {
            selectedDate.className = this.lastClass;
        }

        const { date } = e.target.dataset;
        this.selectedDate = moment(date);
        this.dateContext = moment(date);
        this.lastClass = e.target.className;
        e.target.className = 'selected';
    }

    refreshDateNodes() {
        this.dates = [];
        if(typeof moment === 'undefined' ){
            return;
        }
        const currentMoment = moment(this.dateContext);
        // startOf mutates moment, hence clone before use
        const start = this.dateContext.clone().startOf('month');
        const startWeek = start.isoWeek();
        // months do not always have the same number of weeks. eg. February
        const numWeeks =
            moment.duration(currentMoment.endOf('month') - start).weeks() + 1;
        for (let week = startWeek; week <= startWeek + numWeeks; week++) {
            Array(7)
                .fill(0)
                .forEach((n, i) => {
                    const day = currentMoment
                        .week(week)
                        .startOf('week')
                        .clone()
                        .add(n + i, 'day');
                    let className = '';
                    if (day.month() === this.dateContext.month()) {
                        if (day.isSame(today, 'day')) {
                            className = 'today';
                        } else if (day.isSame(this.selectedDate, 'day')) {
                            className = 'selected';
                        } else {
                            className = 'date';
                        }
                    } else {
                        className = 'padder';
                    }
                    this.dates.push({
                        className,
                        formatted: day.format('YYYY-MM-DD'),
                        text: day.format('DD')
                    });
                });
        }
    }

    connectedCallback() {
        //this.refreshDateNodes();
    }
    

}
