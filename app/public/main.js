import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

/* global fetch */

const InitialState = () => [
  { loading: true },
  [async dispatch => {
    const requestInit = {
      credentials: 'include',
      method: 'post'
    }
    try {
      const response = await fetch('https://deploy-preview-3--accounts-tcc-jonloureiro.netlify.app/.netlify/functions/tokens', requestInit)
      const { access_token: accessToken, username } = await response.json()
      if (!accessToken) throw Error('Without access token')
      dispatch(StoppedLoading, { accessToken, username })
    } catch (e) {
      console.log(e)
      dispatch(StoppedLoading)
    }
  }]
]

const StoppedLoading = (state, data) => {
  return ({ ...state, loading: false, ...data })
}

app({
  init: InitialState,
  view: ({ loading }) => loading
    ? h('main', {}, [
      h('h1', {}, text('Loading'))
    ])
    : h('main', {}, [
      h('h1', {}, text('App 1'))
    ]),
  node: document.getElementById('app')
})
