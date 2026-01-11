const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbPath = path.join(__dirname, 'cfb.db')
const db = new sqlite3.Database(dbPath)

db.all("PRAGMA table_info('saves')", (err, rows) => {
  if (err) { console.error(err); process.exit(1) }
  const has = rows && rows.some(r => r.name === 'userToken')
  if (!has) {
    db.run("ALTER TABLE saves ADD COLUMN userToken TEXT", (e) => {
      if (e) console.error('alter failed', e)
      else console.log('added userToken column')
      db.close()
    })
  } else {
    console.log('userToken column already exists')
    db.close()
  }
})
