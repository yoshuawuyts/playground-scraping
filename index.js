const stream = require('readable-stream')
const jsdom = require('jsdom')
const nets = require('nets')
const pump = require('pump')
const fs = require('fs')

// demo code for the scraper
const vineUrl = 'https://vine.co/v/e2QalQxOA1K'
const ws = fs.createWriteStream('backpain.mp4')
const rs = vineScrape(vineUrl)
pump(rs, ws, function (err) {
  if (err) throw err
  process.stdout.write('succes!')
})

// scrape a vine video from a url
// (str, fn) -> rs
function vineScrape (str, cb) {
  const ps = new stream.PassThrough()

  jsdom.env(vineUrl, function (err, window) {
    if (err) return destroy(ps, err)
    const document = window.document

    const vid = document.querySelector('video')
    if (!vid) return destroy(ps, 'video element not found')

    const src = vid.getAttribute('src')
    if (!src) return destroy(ps, 'src attribute not found')

    // wrangle the url into the right format
    const tail = src.indexOf('?versionId')
    const downloadUrl = src.slice(0, tail)
    pump(nets(downloadUrl), ps)
  })

  return ps
}

// destroy a stream
// (stream, str|obj?) -> null
function destroy (stream, err) {
  process.nextTick(function () {
    if (err) stream.emit('error', err)
    stream.emit('close')
  })
}
