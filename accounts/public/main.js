import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

const OnSubmit = (state, event) => {
  event.preventDefault()
  const [{ value: username }, { value: password }] = event.target
  return [{
    ...state,
    username,
    password,
    loading: true
  }, [dispatch => setTimeout(() => dispatch(StoppedLoading), 1000)]
  ]
}

const InitialState = () => [
  { loading: true, username: 'example', password: '12345678' },
  [dispatch => setTimeout(() => dispatch(StoppedLoading), 1000)]
]

const StoppedLoading = (state) => {
  return ({ ...state, loading: false })
}

app({
  init: InitialState,
  view: ({ loading, username, password }) => loading
    ? h('main', {}, [
        h('h1', {}, text('Loading'))
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
