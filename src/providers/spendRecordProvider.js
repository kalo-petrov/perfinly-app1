import { BASE_URL } from "../common/constants";
import httpProvider from './httpProvider';

const deleteRecord = (e, selectedSpend) => {

    //This needs to be a hook that returns only success or failure and sets the neccessary state base on that

    e.preventDefault();

    if (
      window.confirm(`Are you sure you want to delete this record ${selectedSpend.description}?`)
    ) {
      // httpProvider
      //   .deleteReq(`${BASE_URL}/spending/${selectedSpend._id}`)
      //   .then((data) => {
      //     if (data.error) {
      //       setError(data.error);
      //     } else {
      //       setToggleEdit(false);
      //       setThisMonthSpendRecords((prev) => prev.filter((r) => r._id !== selectedSpend._id));
      //     }
      //   })
      //   .catch((error) => setError(error.toString()));
    } else {
      return;
    }
  };

  export default {
    deleteRecord
  }