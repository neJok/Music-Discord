console.clear()
import { startProviders } from './struct/clients/Provider'
import { startRadio } from './struct/clients/RadioClient'
import center from './struct/clients/MusicCenter'

center.start().then(() => {
    startProviders()
    startRadio()
})