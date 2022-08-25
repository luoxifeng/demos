import { createApp as __createApp } from 'vue?from=auto'


export const createApp = new Proxy(__createApp, {
    apply() {

    }
})
