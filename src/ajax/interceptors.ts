import * as Taro from '@tarojs/taro';


let isAuthorizing = false;
let retryRequests: any[] = [];

/**
 * 重新登录
 * @param {object} config 请求配置对象
 */
function reLogin(request, fly) {
  // return auth().then(() => {
  //   isAuthorizing = false;
  //
  //   // 发起重试请求
  //   retryRequests.forEach((fn) => fn());
  //   retryRequests = [];
  //
  //   // 发起当前请求
  //   return fly.request(request);
  // });
}

/**
 * 请求拦截器：拦截请求配置
 */
function interceptRequest(request) {
  const { headers = {} } = request;
  headers['channel-type'] = 'wx';
  headers['content-type'] = 'application/json';
  return request;
}

/**
 * 响应拦截器：拦截请求成功
 */
function interceptSuccess(response) {
  const { data, request } = response;
  /** 处理 code 为非 0 */
  if (data.code !== 0 && request.autoHandleCode) {
    Taro.showToast({
      icon: 'none',
      title: data.message || '网络异常，请稍后重试',
    });
  }

  return data;
}

/**
 * 响应拦截器：拦截请求失败
 */
function interceptFail(err, fly) {
  const { status, request } = err;

  // 401：重登
  if (status === 401) {
    if (isAuthorizing) {
      /** 前面有请求正在进行授权，则重新发起该请求，进入请求队列 */
      const resolve = (r) => retryRequests.push(() => r(fly.request(request)));
      return new Promise(resolve);
    }
    isAuthorizing = true;

    // 登录
    return reLogin(request, fly);
  }


  // 异常提示信息
  let message = `服务器异常，请稍后重试;status=${status}`;
  if (status === 0) message = '网络异常';
  if (status === 1) message = '请求超时，请稍后重试';
  if (status === 400) message = '客户端异常';
  if (status === 401) message = '授权失败';
  if (status === 403) message = '无权限，请联系管理员';
  if (status === 404) message = '请求链接未找到';
  if (/^5\d{2}/.test(status)) message = '服务器繁忙';

  // 用户提示
  if (request.autoHandleCode) {
    Taro.showToast({
      icon: 'none',
      title: message,
    });
  }

  return Promise.resolve({ code: -1, message });
}

export default {
  interceptRequest,
  interceptSuccess,
  interceptFail,
};
