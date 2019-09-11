import { Logger } from '@alipay/o3-base';

export function log (...args: any) {
  Logger.info('🚀 [o3-engine-stats]', ...args)
}

export function errorLog (...args: any) {
  Logger.error('🚀 [o3-engine-stats]', ...args)
}