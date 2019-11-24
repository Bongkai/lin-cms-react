import moment from 'moment'

export default function timeFormatter(time) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}