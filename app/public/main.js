import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

/* global fetch, Headers, btoa */

const FetchingResource = (state, data) => [
  UpdateState(state, { ...data, messages: [...data.messages, 'Fetching Resource...'] }),
  [async dispatch => {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${data.accessToken}`)
    const requestInit = {
      credentials: 'include',
      method: 'get',
      headers
    }
    const messages = []
    try {
      const response = await fetch('/.netlify/functions/resource', requestInit)
      const { resource, message } = await response.json()
      if (!resource) throw Error(message)
      messages.push(`Resource: "${resource}"`)
      dispatch(UpdateState, { messages })
    } catch (e) {
      messages.push(e.message)
      dispatch(UpdateState, { error: true, messages })
    }
  }]
]

const InitialState = () => [
  { accessToken: '', error: false, messages: ['Fetching Token...'] },
  [async dispatch => {
    const requestInit = {
      credentials: 'include',
      method: 'post'
    }
    const messages = []
    try {
      const response = await fetch('https://accounts.jonloureiro.dev/.netlify/functions/tokens', requestInit)
      const { access_token: accessToken, username, message } = await response.json()
      if (!accessToken) throw Error(message)
      messages.push('With Token...')
      messages.push(`Username: "${username}"`)
      dispatch(FetchingResource, { accessToken, messages })
    } catch (e) {
      messages.push(e.message)
      dispatch(UpdateState, { error: true, messages })
    }
  }]
]

const UpdateState = (state, data) => ({
  ...state,
  ...data,
  messages: [...state.messages, ...data.messages]
})

app({
  init: InitialState,
  view: ({ error, messages }) => h('main', {}, [
    h('h1', {}, text(`App (${window.location.hostname.split('.')[1]})`)),
    h('ul', {}, [
      ...messages.map(message => {
        return h('li', {}, text(message))
      }),
      error && h('li', {}, [
        h('a', { href: `https://accounts.jonloureiro.dev/login?callback=${btoa(window.location.origin)}` }, text('Login'))
      ])
    ])
  ]),
  node: document.getElementById('app')
})
