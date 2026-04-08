import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

function loadEnv(filePath: string) {
  const text = fs.readFileSync(filePath, { encoding: 'utf8' })
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (!key) continue
    const value = rest.join('=').trim().replace(/^"|"$/g, '')
    process.env[key] = value
  }
}

function escapeValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
  const raw = String(value)
  const escaped = raw.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return `'${escaped}'`
}

async function main() {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) loadEnv(envPath)

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL bulunamadı. .env dosyanızı kontrol edin.')
  }

  const prisma = new PrismaClient({ log: [] })
  await prisma.$connect()

  const tables = await prisma.$queryRawUnsafe<Array<{ 'TABLE_NAME': string }>>(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`,
  )

  const tableNames = tables.map((row) => (row as any).TABLE_NAME as string)
  const dumpFile = path.join(process.cwd(), 'prisma', 'full_export.sql')
  const parts: string[] = []
  parts.push('-- Full SQL export from database')
  parts.push(`-- Generated: ${new Date().toISOString()}`)
  parts.push('SET FOREIGN_KEY_CHECKS=0;')

  for (const tableName of tableNames) {
    const createRow = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(`SHOW CREATE TABLE \`${tableName}\``)
    const createSqlRaw = (createRow[0] as any)['Create Table'] ?? (createRow[0] as any).f1 ?? Object.values(createRow[0])[1]
    if (!createSqlRaw || typeof createSqlRaw !== 'string') {
      throw new Error(`CREATE TABLE SQL alınamadı: ${tableName}`)
    }
    const createSql = createSqlRaw.replace(/"/g, '`')

    parts.push(`\n-- -----------------------------------------------------`)
    parts.push(`-- Table structure for table \`${tableName}\``)
    parts.push(`-- -----------------------------------------------------`)
    parts.push(`DROP TABLE IF EXISTS \`${tableName}\`;`)
    parts.push(createSql + ';')

    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(`SELECT * FROM \`${tableName}\``)
    if (rows.length === 0) continue

    parts.push(`\n-- -----------------------------------------------------`)
    parts.push(`-- Data for table \`${tableName}\``)
    parts.push(`-- -----------------------------------------------------`)

    const columns = Object.keys(rows[0])
    const header = `INSERT INTO \`${tableName}\` (${columns.map((col) => `\`${col}\``).join(', ')}) VALUES`
    const rowValues = rows.map((row) => `(${columns.map((col) => escapeValue(row[col])).join(', ')})`)
    parts.push(header)
    parts.push(rowValues.join(',\n') + ';')
  }

  parts.push('\nSET FOREIGN_KEY_CHECKS=1;')
  fs.writeFileSync(dumpFile, parts.join('\n\n'), { encoding: 'utf8' })
  console.log(`Export tamamlandı: ${dumpFile}`)
  console.log(`Tablolar: ${tableNames.join(', ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
