import config from 'js/config'

export default {
  removeHTMLTag(str) {
    str = str.replace(/<\/?[^>]*>/g, '') //去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n') //去除行尾空白
    str = str.replace(/ /ig, '') //去掉
    return str
  },
  addURLToImage(data) {
    data = data.replace(/src=(\"|\')/g, `src="${config.imgCDN}/`)
    return data
  },
  removeURLToImage(data) {
    const reg = new RegExp(`${config.imgCDN}\/`, 'ig')
    data = data.replace(reg, '')
    return data
  }
}
