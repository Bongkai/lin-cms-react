import moment from 'moment'

export default function timeFormatter(time: number): string {
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}
