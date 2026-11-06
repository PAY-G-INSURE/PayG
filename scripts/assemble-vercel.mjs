import { cp, mkdir, rm } from 'node:fs/promises'

const source = new URL('../health-insurance/frontend/dist/', import.meta.url)
const destination = new URL('../dist/health-insurance/', import.meta.url)

await mkdir(destination, { recursive: true })
await rm(destination, { recursive: true, force: true })
await cp(source, destination, { recursive: true })
console.log('Health insurance frontend copied to dist/health-insurance')
