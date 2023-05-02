import EventOptions from './EventOptions'

export default interface IEvent {
    name: string,
    options: EventOptions,
    run: Function
}