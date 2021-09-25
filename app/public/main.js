import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

/* global fetch, Headers */

const FetchingResource = (state, data) => [
  { ...state, fetchingToken: false, fetchingResource: true, ...data },
  [async dispatch => {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${data.accessToken}`)
    const requestInit = {
      credentials: 'include',
      method: 'get',
      headers
    }
    try {
      const response = await fetch('/.netlify/functions/resource', requestInit)
      const { resource } = await response.json()
      if (!resource) throw Error('Without Resource')
      dispatch(StoppedLoading, { resource })
    } catch (e) {
      console.log(e)
      dispatch(Fail)
    }
  }]
]

const InitialState = () => [
  { fetchingToken: true, fetchingResource: false, accessToken: '', username: '', resource: '' },
  [async dispatch => {
    const requestInit = {
      credentials: 'include',
      method: 'post'
    }
    try {
      const response = await fetch('https://accounts.jonloureiro.dev/.netlify/functions/tokens', requestInit)
      const { access_token: accessToken, username } = await response.json()
      if (!accessToken) throw Error('Without access token')
      dispatch(FetchingResource, { accessToken, username })
    } catch (e) {
      console.log(e)
      dispatch(StoppedLoading)
    }
  }]
]

const StoppedLoading = (state, data) => {
  return ({ ...state, fetchingToken: false, fetchingResource: false, ...data })
}

const Fail = (state) => {
  return { ...state, accessToken: '', fetchingToken: false, fetchingResource: false }
}

app({
  init: InitialState,
  view: ({ fetchingToken, fetchingResource, accessToken, username, resource }) => h('main', {}, [
    h('h1', {}, text('App')),
    h('ul', {}, [
      fetchingToken && h('li', {}, text('Fetching Token...')),
      !fetchingToken && accessToken && h('li', {}, text('With Token...')),
      !fetchingToken && accessToken && h('li', {}, text(`User: ${username}`)),
      accessToken && fetchingResource && h('li', {}, text('Fetching Resource...')),
      accessToken && !fetchingResource && h('li', {}, text(`Resource: ${resource}`)),
      !accessToken &&
      !fetchingToken &&
      !fetchingResource &&
      h('a', { href: 'https://accounts.jonloureiro.dev/login' }, text('Login'))
    ])
  ]),
  node: document.getElementById('app')
})
