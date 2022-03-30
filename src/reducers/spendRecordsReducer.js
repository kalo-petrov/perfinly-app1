const spendRecordsReducer = (spendRecords = [], action) => {
  switch (action.type) {
    case 'All_SPEND_RECORDS':
      return [...action.payload];
    default:
      return spendRecords;
  }
};

export default spendRecordsReducer;
