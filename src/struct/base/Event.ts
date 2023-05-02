import EventOptions from '@customTypes/struct/base/EventOptions'

class Event {
    name: string
    options: EventOptions
    run: Function

    constructor(name: string, options: EventOptions, run: Function) {
        this.name = name
        this.options = options
        this.run = run
    }
}

export default Event