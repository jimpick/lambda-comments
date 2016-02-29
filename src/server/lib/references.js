import slugid from 'slugid'

export function generateReference (date) {
  const ref = date.format('YYYY/MM/DD/HH:mm-') + slugid.v4()
  return ref
}
