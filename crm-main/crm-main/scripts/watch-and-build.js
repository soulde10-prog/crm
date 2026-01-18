// Cross-platform watcher that runs the existing build script when source files change.
// Usage: node ./scripts/watch-and-build.js
const { spawn } = require('child_process')
const chokidar = require('chokidar')
const path = require('path')

const root = process.cwd()
const buildCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const watchPaths = [
  path.join(root, 'src'),
  path.join(root, 'popup'),
  path.join(root, 'background'),
  path.join(root, 'public'),
  path.join(root, 'scripts')
]

// simple debounce to avoid running build repeatedly for bursty saves
let buildTimer = null
const DEBOUNCE_MS = 300

function runBuild() {
  console.log('[watch-and-build] running build...')
  const p = spawn(buildCmd, ['run', 'build'], { stdio: 'inherit' })
  p.on('close', code => {
    console.log(`[watch-and-build] build exited with code ${code}`)
  })
}

const watcher = chokidar.watch(watchPaths, { ignoreInitial: true, persistent: true })

watcher.on('all', (event, filePath) => {
  console.log(`[watch-and-build] ${event}: ${filePath}`)
  if (buildTimer) clearTimeout(buildTimer)
  buildTimer = setTimeout(runBuild, DEBOUNCE_MS)
})

watcher.on('ready', () => {
  console.log('[watch-and-build] watcher ready — watching for changes')
})
