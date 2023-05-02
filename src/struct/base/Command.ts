import CommandOptions from '@customTypes/struct/base/CommandOptions'

class Command {
    name: string
    options: CommandOptions
    run: Function
    autoComplete: Function | undefined

    constructor(name: string, options: CommandOptions, run: Function, autoComplete?: Function) {
        this.name = name
        this.options = options
        this.run = run
        this.autoComplete = autoComplete
    }
}

export default Command