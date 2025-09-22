#!/usr/bin/env node
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  try {
    const emailArg = process.argv.find(a => a.startsWith('--email='))
    const email = emailArg ? emailArg.split('=')[1] : null
    if (!email) {
      console.error('Usage: node scripts/promote_admin.mjs --email=you@example.com')
      process.exit(2)
    }

    const dbPath = path.join(__dirname, '..', 'database.db')
    const db = await open({ filename: dbPath, driver: sqlite3.Database })

    const user = await db.get('SELECT id, email, role FROM users WHERE email = ?', [email])
    if (!user) {
      console.error(`No user found with email: ${email}`)
      process.exit(1)
    }

    await db.run("UPDATE users SET role='admin' WHERE email = ?", [email])
    const updated = await db.get('SELECT id, email, role FROM users WHERE email = ?', [email])
    console.log('User promoted to admin:', updated)
    process.exit(0)
  } catch (err) {
    console.error('Error promoting user:', err)
    process.exit(1)
  }
}

main()
