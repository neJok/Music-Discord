import CommandOptions from './CommandOptions'

export default interface ICommand {
    name: string,
    options: CommandOptions,
    run: Function,
    autoComplete?: Function
}