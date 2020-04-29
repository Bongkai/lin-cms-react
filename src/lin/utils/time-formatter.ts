import dayjs from 'dayjs'

const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export function timeFormatter(
  time: number,
  format: string = DEFAULT_TIME_FORMAT,
) {
  return dayjs(time).format(format)
}
