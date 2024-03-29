import { ILogItem } from '@/types/model'

/**
 *
 * @param {string} keyword
 * @param {Array} logs
 */
export async function searchLogKeyword(
  keyword: string,
  logs: ILogItem[],
  className: string = 'strong',
): Promise<ILogItem[]> {
  const _logs = logs.map(log => {
    let msg = log.message
    msg = msg.replace(
      RegExp(`${keyword}`, 'g'),
      `<span class="${className}">${keyword}</span>`,
    )
    // eslint-disable-next-line
    log.message = msg
    return log
  })
  return _logs
}
