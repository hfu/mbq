const Database = require('better-sqlite3')
const zlib = require('zlib')
const fs = require('fs')
const params = {
  src: '/home/dltiles/7-75-63-uganda.mbtiles',
  gzipped: true
}
const v2q = v => {
  for(let i = 0; true; i++) {
    if(v / (2 ** i) < 1) return i - 1
  }
}
const ZBOUND = 19
const QBOUND = 25
let r = new Array(QBOUND)
for(let q = 0; q < QBOUND; q++) {
  r[q] = new Array(ZBOUND).fill(0)
}
const show = () => {
  console.log('qz ' + 
    new Array(ZBOUND).fill(0).map((v, i) => {
      return ('  ' + i).substr(-2)
    }).join(' '))
  for(let k in r) {
    const q = k - 1
    console.log(('  ' + (k - 1)).substr(-2) + ' ' +
      r[k].map(v => {return (('  ' + v2q(v))).substr(-2)}).join(' '))
  }
}

let path = params.src
if (process.argv.length == 3) path = process.argv[2]
if (!fs.existsSync(path)) throw `${path} not found.`
const db = new Database(path)
let count = 0
const size = db.prepare('SELECT count(*) FROM tiles').get()['count(*)']
for (const row of db.prepare('SELECT * FROM tiles').iterate()) {
  const z = row.zoom_level
  let data = row.tile_data
  if(params.gzipped) data = zlib.gunzipSync(data)
  const q = v2q(data.length)
  r[q + 1][z] += 1
  count ++
  if(count % 5000 === 0) {
    console.log(`${path}: ${count}(${Math.floor(100.0 * count / size)}%)`)
    show()
  }
}
console.log(`final result for ${path} (${count} tiles)`)
show()
