const moment = require('moment');

const anyPeriodMonthly = (fromDate, toDate) => {
  const startDate = moment(fromDate).format('yyyy-MM-DD');
  const endDate = moment(toDate).format('yyyy-MM-DD');

  const daysCount = (moment(endDate) - moment(startDate)) / 86400000 + 1;

  const monthsArray = [];

  for (let i = 0; i < daysCount; i += 1) {
    const monthStart = moment(fromDate).add(i, 'days').startOf('month').format('yyyy-MM-DD');

    monthsArray.push(monthStart);
  }
  const mapped = Array.from(new Set(monthsArray));
  return mapped;
};

const anyPeriodWeekly = (fromDate, toDate) => {
  const startDate = moment(fromDate).format('yyyy-MM-DD');
  const endDate = moment(toDate).format('yyyy-MM-DD');

  const daysCount = (moment(endDate) - moment(startDate)) / 86400000 + 1;
  const weeksArray = [];

  if (daysCount === 1) {
    const weekStart = moment(fromDate).startOf('isoWeek').format('yyyy-MM-DD');
    const weekEnd = moment(fromDate).endOf('isoWeek').format('yyyy-MM-DD');
    
    weeksArray.push({ weekStart, weekEnd });
  }
  for (let i = 1; i < daysCount; i += 7) {
    const weekStart = moment(fromDate).add(i, 'days').startOf('isoWeek').format('yyyy-MM-DD');
    const weekEnd = moment(fromDate).add(i, 'days').endOf('isoWeek').format('yyyy-MM-DD');
    
    weeksArray.push({ weekStart, weekEnd });
  }

  if (weeksArray[weeksArray.length-1].weekEnd < endDate) {
    const weekStart = moment(endDate).startOf('isoWeek').format('yyyy-MM-DD');
    const weekEnd = moment(endDate).endOf('isoWeek').format('yyyy-MM-DD');
    weeksArray.push({ weekStart, weekEnd });
  }
  const mapped = Array.from(new Set(weeksArray));
  return mapped;
};

const last7days = () => {
  const today = moment(new Date()).format('yyyy-MM-DD');
  const daysArray = [];
  for (let i = 6; i >= 0; i--) {
    const dayToAdd = moment(today).subtract(i, 'days').format('yyyy-MM-DD');
    daysArray.push(dayToAdd);
  }
  return daysArray;
};

const thisMonth = () => {
  const thisMonthStart = moment().startOf('month').format('yyyy-MM-DD');
  const daysNumber = moment().endOf('month').format('DD');

  const daysArray = [thisMonthStart];
  for (let i = 1; i < daysNumber; i++) {
    const dayToAdd = moment(thisMonthStart).add(i, 'days').format('yyyy-MM-DD');
    daysArray.push(dayToAdd);
  }
  return daysArray;
};

const lastMonth = () => {
  const lastMonthStart = moment().subtract(1, 'months').startOf('month').format('yyyy-MM-DD');
  const daysNumber = moment().subtract(1, 'months').endOf('month').format('DD');

  const daysArray = [lastMonthStart];
  for (let i = 1; i < daysNumber; i++) {
    const dayToAdd = moment(lastMonthStart).add(i, 'days').format('yyyy-MM-DD');
    daysArray.push(dayToAdd);
  }
  return daysArray;
};

const anyPeriod = (fromDate, toDate) => {
  const startDate = moment(fromDate).format('yyyy-MM-DD');
  const endDate = moment(toDate).format('yyyy-MM-DD');

  const daysCount = (moment(endDate) - moment(startDate)) / 86400000;

  const daysArray = [startDate];
  for (let i = 1; i <= daysCount; i++) {
    const dayToAdd = moment(startDate).add(i, 'days').format('yyyy-MM-DD');
    daysArray.push(dayToAdd);
  }
  return daysArray;
};

const dateProvider = {
  last7days,
  thisMonth,
  lastMonth,
  anyPeriod,
  anyPeriodMonthly,
  anyPeriodWeekly,
};

export default dateProvider;
