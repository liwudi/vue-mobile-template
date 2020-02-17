/**
 * Created by mapbar_front on 2019-10-08.
 */
import Request from '@/services/request';
import Config from '@/index.config.js';

// 登陆login页面
export function login (data) {
    return Request.post(Config.baseUrl + '/v2/repay/dg/login', data);
}
