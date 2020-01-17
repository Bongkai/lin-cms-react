import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { persistStore } from 'redux-persist'
import reducers from './reducers'
import { IAppState } from './redux/app.redux'

export interface IStoreState {
  app: IAppState
}

const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk)))

const persistor = persistStore(store)

export { store, persistor }
