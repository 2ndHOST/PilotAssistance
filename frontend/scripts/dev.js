#!/usr/bin/env node
const net = require('net')
const { spawn } = require('child_process')

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '0.0.0.0')
  })
}

async function main() {
  // const preferred = [3000, 4000, 5173]
  let chosen = 5173
  // for (const p of preferred) {
  //   // eslint-disable-next-line no-await-in-loop
  //   const free = await checkPort(p)
  //   if (free) { chosen = p; break }
  // }

  const args = ['--port', String(chosen)]
  const vite = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', ...args], {
    stdio: 'inherit',
    shell: false,
  })

  console.log(`\n➡️  Starting frontend on http://localhost:${chosen}\n`)

  vite.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


