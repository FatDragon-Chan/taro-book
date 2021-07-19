import Fly from 'flyio/dist/npm/wx';
import { Fly as IFly, FlyRequestConfig } from 'flyio';
import interceptors from '@/ajax/interceptors';

type Options = {
  baseURL: string;
  timeout?: number;
  autoHandleCode?: boolean;
}

interface CustomOptions extends FlyRequestConfig {
  /** 是否自动处理 code，默认 true */
  autoHandleCode?: boolean;
}

type Response = {
  code: number;
  data: any;
  message: string;
}

const initialOptions: Required<Omit<Options, 'baseURL'>> = {
  timeout: 10000,
  autoHandleCode: true,
};

class Ajax {
  fly: IFly;

  $options: Options;

  $interceptor: typeof interceptors;

  constructor(options: Options) {
    this.fly = new Fly();
    this.$options = {
      ...initialOptions,
      ...options,
    };

    this.setInterceptor();
  }

  /**
   * 设置拦截器
   */
  setInterceptor() {
    const {
      interceptRequest,
      interceptSuccess,
      interceptFail,
    } = interceptors;
    /**
     * 请求拦截器
     */
    this.fly.interceptors.request.use(interceptRequest);

    /**
     * 响应拦截器
     */
    this.fly.interceptors.response.use(
      interceptSuccess,
      (reason) => interceptFail(reason, this.fly),
    );
  }

  /**
   * 发送请求
   */
  request(url: string, data: any, options: Options & CustomOptions) {
    return this.fly.request(url, data, options) as any as Response;
  }

  /**
   * get 方法
   */
  public get(path = '', customOptions: CustomOptions = {}) {
    return (data = {}, expandURL = '') => {
      const reqURL = expandURL ? `${path}/${expandURL}` : path;
      const options = {
        ...this.$options,
        ...customOptions,
        method: 'GET',
      };

      return this.request(reqURL, data, options);
    };
  }

  /**
   * post 方法
   */
  post(path = '', customOptions: CustomOptions = {}) {
    return (data = {}, expandURL = '') => {
      const reqURL = expandURL ? `${path}/${expandURL}` : path;
      const options = {
        ...this.$options,
        ...customOptions,
        method: 'POST',
      };

      return this.request(reqURL, data, options);
    };
  }
}

export default Ajax;
