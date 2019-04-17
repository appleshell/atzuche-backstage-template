import axios from 'axios'
import { getToken, clearToken } from './token'

const config = {
  production: '/apigateway/',
  development: '/proxy/apigateway/',
  test: '/apigateway/'
}

const baseURL = config[process.env.PACKAGE]
  ? config[process.env.PACKAGE]
  : config['development']

const http = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json;version=3.0;compress=false',
    'Content-Type': 'application/json;charset=utf-8'
  }
})

http.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = token
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  config => {
    console.log('config', config)
    if (config.data.resCode === '000000') {
      return config.data.data
    }

    if (config.data.resCode === '200008') {
      clearToken()
      history.replaceState(null, '', '/system/login')
      location.reload()
      return
    }

    return Promise.reject({
      code: config.data.resCode,
      msg: config.data.resMsg,
      data: null
    })
  },
  err => {
    console.log('err', err)
    return Promise.reject({
      code: err.response.data.resCode,
      msg: err.response.data.resMsg,
      data: null
    })
  }
)

export default http