/**
 * Created by mapbar_front on 2019-05-20.
 */
import Vue from 'vue';
import { Toast, Dialog } from 'vant';
import axios from 'axios';
import router from '@/router';
import Config from '@/index.config.js';
let baseUrl = Config.baseUrl;
Vue.use(Toast);
Vue.use(Dialog);

// 服务端异常码处理
function AbnormalCodeProcessing (data) {
  // 针对微信的异常拦截。
  if (data.success === 'false') {
    let code = data.error.code;
    let message = data.error.message;
    if (code === '10100') {
      router.replace({path: '/authentication/authentication'});
    } else if (code === '20100') {
      router.replace({
        path: '/authentication/authentication',
        query: {
          userInfo: message
        }
      });
    } else {
      Dialog.alert({
        message: message
      });
    }
  }
  // 针对客户App的异常提示
  if (data.success === 'true') {
    if (data.result) {
      let code = data.result.code;
      let msg = data.result.msg;
      if (code) {
        Dialog.alert({
          message: msg
        });
      }
    }
  }
}

// 为空数据清洗
function dataDeal (config) {
  if (!config.data || isEmptyObj(config.data)) {
    delete config.data;
  } else {
    config.data = isFormData(config.data) ? config.data : jsonFilter(config.data);
  }
  if (!config.params || isEmptyObj(config.params)) {
    delete config.params;
  } else {
    config.params = isFormData(config.params) ? config.params : jsonFilter(config.params);
  }
  return config;
}

function jsonFilter (obj) {
  for (let i in obj) {
    if (obj[i] === null || obj[i] === undefined || obj[i] === '') {
      delete obj[i];
    }
  }
  return obj;
}

function isEmptyObj (obj) {
  let isEmpty = true;
  for (let i in obj) {
    isEmpty = false;
    break;
  }
  return isEmpty;
}

function isFormData (obj) {
  return obj instanceof FormData;
}
function serialize(data) {
  let str = '';
  for (let i in data) {
    str += '&' + i + '=' + data[i];
  }
  return str.substr(1);
}

function request (options) {
  const opts = {
    withCredentials: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${localStorage.getItem('token_wxpay')}`,
      'openid': localStorage.getItem('openid_wxpay'),
      'system': 'wechat',
      'time': new Date().getTime()
    }
  };
  opts.url = /^(http|https):\/\//.test(options.url) ? options.url : baseUrl + options.url;
  if (options.method.toLowerCase() === 'post') {
    opts.method = 'post';
    opts.data = serialize(options.data);
  } else {
    opts.method = 'get';
    opts.params = options.data;
  }
  // 如果是转发接口
  if (options.type === 'transfer') {
    opts.headers = {
      ...opts.headers,
      httpMethod: options.data.httpMethod,
      dragonUrl: options.data.dragonUrl,
      userId: options.data.userId,
      dgToken: options.data.dgToken
    };
    opts.data = serialize(options.data.body);
  }
  if (options.type === 'verifyCode') {
    opts.responseType = 'blob';
  }
  let config = opts;
  return axios.request(config).then(res => {
    return res.data;
  }).catch(err => {
    console.log(err);
  });
}

export default {
  get: function (url, data, config) {
    return request({
      method: 'GET',
      url,
      ...config,
      data: Object.assign({}, data)
    });
  },
  post: function (url, data, config) {
    return request({
      url,
      data,
      ...config,
      method: 'POST'
    });
  },
  request
};

axios.interceptors.response.use(function (response) {
  if (response.status === 200) {
    AbnormalCodeProcessing(response.data);
    return response;
  } else {
    Toast.fail('error code ' + response.status);
  }
  return response;
}, function (error) {
  Toast.fail(error.toString());
  return Promise.reject(error);
});

axios.interceptors.request.use(function (config) {
  // config = dataDeal(config);
  return config;
}, function (error) {
  Toast.fail(error.toString());
  return Promise.reject(error);
});
