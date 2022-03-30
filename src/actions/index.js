export const getAllSpendRecords = (spendRecords) => {
  return {
    type: 'All_SPEND_RECORDS',
    payload: spendRecords,
  };
};
