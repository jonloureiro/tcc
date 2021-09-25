import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

/* global fetch, Headers */

const OnSubmit = (state, event) => {
  event.preventDefault()
  const [{ value: username }, { value: password }] = event.target
  return [{
    ...state,
    username,
    password,
    loading: true
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
    const response = await fetch('/.netlify/functions/login', requestInit)
    const { access_token: accessToken } = await response.json()
    dispatch(StoppedLoading, { accessToken, username, password: '' })
  }]
  ]
}

const InitialState = () => [
  { loading: true, username: 'example', password: '12345678' },
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
      const { access_token: accessToken, username } = await response.json()
      if (!accessToken) throw Error('Without access token')
      dispatch(StoppedLoading, { accessToken, username, password: '' })
    } catch (e) {
      dispatch(StoppedLoading)
      console.log(e)
    }
  }]
]

const StoppedLoading = (state, data) => {
  return ({ ...state, loading: false, ...data })
}

app({
  init: InitialState,
  view: ({ loading, username, password, accessToken }) => loading || accessToken
    ? h('main', {}, [
        loading && h('h1', {}, text('Loading')),
        accessToken && h('div', {}, [
          h('h1', {}, text('Sucess')),
          h('h1', {}, text(`user: ${username}`))
        ])
      ])
    : h('main', {}, [
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
    ]),
  node: document.getElementById('app')
})
