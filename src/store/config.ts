import { appState } from './state'

import { StoreConfig } from 'dream-redux'

export const config: StoreConfig = {
  reducerConfig: [
    {
      name: 'app',
      initialState: appState,
      persist: {
        whitelist: ['logined', 'user', 'permissions'],
      },
    },
  ],
}
