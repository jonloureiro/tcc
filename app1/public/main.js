import { h, text, app } from 'https://unpkg.com/hyperapp@2.0.19/index.js'

/* global fetch */

const AddTodo = (state) => ({
  ...state,
  value: '',
  todos: state.todos.concat(state.value)
})

const NewValue = (state, event) => ({
  ...state,
  value: event.target.value
})

const OnSubmit = (_, event) => {
  event.preventDefault()
  return AddTodo
}

const InitialState = () => [
  { todos: [], loading: true, value: '' },
  [dispatch => { // TODO: arrumar esse fetch para o 401
    fetch('http://localhost:8889/.netlify/functions/todos')
      .then(response => response.json())
      .then(({ data }) => dispatch(UpdateState, data))
  }]
]

const UpdateState = (state, data) => {
  return ({ ...state, loading: false, todos: data })
}

app({
  init: InitialState,
  view: ({ todos, loading, value }) => loading
    ? h('h1', {}, text('Loading'))
    : h('main', {}, [
      h('h1', {}, text('App 1 - Lista de tarefas')),
      h('form', { onsubmit: OnSubmit }, [
        h('input', { type: 'text', oninput: NewValue, value }),
        h('input', { type: 'submit', value: 'Adicionar' })
      ]),
      h('ul', {},
        todos.map((todo) => h('li', {}, text(`${todo.id} ${todo.description}`)))
      )
    ]),
  node: document.getElementById('app')
})
