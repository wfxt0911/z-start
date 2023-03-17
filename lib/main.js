#! /usr/bin/env node
const { start } = require('./commander/index.js')
const diskinfo = require('diskinfo');
const Database = require('better-sqlite3')
const fs = require('fs-extra')

const getDisks = () => {
    return new Promise((resolve, reject) => {
        diskinfo.getDrives(function (err, aDrives) {
            if (err) return reject()
            resolve(aDrives)
        });
    })
}
const create_table_project =
    `CREATE TABLE if not exists project
     (
         id      INTEGER PRIMARY KEY AUTOINCREMENT,
         name    VARCHAR(255)           NOT NULL,
         path    VARCHAR(255)           NOT NULL
     );`


getDisks().then(disks => {
    const disk = disks[0]?.mounted || 'C:'
    const basePath=disk+ "\\z-start"
    fs.ensureDirSync(basePath)
    const db = new Database(basePath + "\\z-start.db", { readonly: false })
    db.exec(create_table_project)
    start(db)
})

