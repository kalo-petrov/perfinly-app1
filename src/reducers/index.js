import { combineReducers } from 'redux';
import spendRecordsReducer from './spendRecordsReducer'

const allReducers = combineReducers({
  spendRecords: spendRecordsReducer,
});

export default allReducers;
