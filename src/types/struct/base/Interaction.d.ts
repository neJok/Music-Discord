import InteractionOptions from './InteractionOptions'

export default interface IInteraction {
    name: string,
    options: InteractionOptions,
    run: Function
}