import React from 'react'
import { hydrate } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import App from './components/App';
import reducer from './reducers';

require('./resources/css/normalize.css');
// require('./resources/sass/default.sass');
// require('./resources/sass/_var.sass');
// require('./resources/sass/all.sass');
require('./resources/sass/styles.sass');
// require('./resources/sass/animation.sass');
// require('./resources/sass/mobile.sass');
// require('./resources/fonts/ptsans/stylesheet.css');
 


const store = createStore(reducer, window.__INITIAL_STATE__, applyMiddleware(thunk));
console.log(store);


hydrate(
    <AppContainer>
        <Provider store={store}>
            <App />
        </Provider>
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./components/App', () => {
        const NextApp = require('./components/App').default;
        hydrate(
            <AppContainer>
                <Provider store={store}>
                    <NextApp />
                </Provider>
            </AppContainer>,
            document.getElementById('root')
        );
    });
}