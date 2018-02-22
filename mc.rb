const Database = require('better-sqlite3')
const zlib = require('zlib')
const v2q = v => {
  for(let i = 0; true; i++) {
    if(v / (2 ** i) < 1) return i - 1
  }
}
