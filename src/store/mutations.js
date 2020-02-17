/**
 * Created by mapbar_front on 2019-05-24.
 */
import { SETUSERINFO, SETLOANLIST, SETTITLE } from './type';

export default {
  [SETUSERINFO] (state, value) {
    state.userInfo = value;
  },
  [SETLOANLIST] (state, value) {
    state.loanList = value;
  },
  [SETTITLE] (state, value) {
    state.title = value;
  }
};
