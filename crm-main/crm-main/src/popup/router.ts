export type Route = 'workflow'|'pricing'|'templates'|'forms'|'settings'|'audit'|'onboard'

export function navigate(route: Route) {
  window.location.hash = `#/${route}`
}

export function currentRoute(): Route {
  const r = location.hash.replace('#/', '') as Route
  if (!r) return 'workflow'
  return r
}