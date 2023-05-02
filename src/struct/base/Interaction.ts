import InteractionOptions from '@customTypes/struct/base/InteractionOptions'

class Interaction {
    name: string
    options: InteractionOptions
    run: Function
    autoComplete: Function | undefined

    constructor(name: string, options: InteractionOptions, run: Function, autoComplete?: Function) {
        this.name = name
        this.options = options
        this.run = run
        this.autoComplete = autoComplete
    }
}

export default Interaction