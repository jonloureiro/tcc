import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

/* global fetch, Headers, alert, atob */

const OnSubmit = (state, event) => {
  event.preventDefault()
  const [{ value: username }, { value: password }] = event.target
  return [{
    ...state,
    username,
    password,
    message: 'Fetching...'
  }, [async dispatch => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const requestInit = {
      credentials: 'include',
      method: 'post',
      headers,
      body: JSON.stringify({
        username,
        password
      })
    }
    try {
      const response = await fetch('/.netlify/functions/login', requestInit)
      const { access_token: accessToken } = await response.json()
      if (!accessToken) throw Error('Without access token')
      dispatch(UpdateData, { message: 'Redirecting...' })
      setTimeout(redirecting, 1000)
    } catch (e) {
      alert(e.message)
      dispatch(WithoutMessage)
    }
  }]
  ]
}

const InitialState = () => [
  { message: 'Loading...', username: 'example', password: '12345678' },
  [async dispatch => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const requestInit = {
      credentials: 'include',
      method: 'post',
      headers
    }
    try {
      const response = await fetch('/.netlify/functions/tokens', requestInit)
      const { access_token: accessToken } = await response.json()
      if (!accessToken) throw Error('Without access token')
      dispatch(UpdateData, { message: 'Redirecting...' })
      setTimeout(redirecting, 1000)
    } catch (e) {
      console.log(e.message)
      dispatch(WithoutMessage)
    }
  }]
]

const WithoutMessage = (state, data) => {
  return ({ ...state, message: '', ...data })
}

const UpdateData = (state, data) => {
  return ({ ...state, ...data })
}

const redirecting = () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  let redirectURL = 'https://tcc.jonloureiro.dev'
  if (params && params.callback) { redirectURL = atob(params.callback) }
  window.location.href = redirectURL
}

app({
  init: InitialState,
  view: ({ message, username, password }) =>
    h('main', {}, message
      ? [h('h1', {}, text(message))]
      : [
          h('h1', {}, text('Accounts')),
          h('form', { onsubmit: OnSubmit }, [
            h('div', { class: 'form-group' }, [
              h('label', { for: 'username' }, text('Username')),
              h('input', { type: 'text', value: username, id: 'username' })
            ]),
            h('div', { class: 'form-group' }, [
              h('label', { for: 'password' }, text('Password')),
              h('input', { type: 'password', value: password, id: 'password' })
            ]),
            h('input', { type: 'submit', value: 'Login' })
          ])
        ]
    ),
  node: document.getElementById('app')
})
