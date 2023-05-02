import { ApplicationCommandDataResolvable } from 'discord.js';

export default interface ICommandOptions {
    roles?: string[],
    disabled?: boolean,
    owner?: boolean,
    voice?: boolean,

    data: ApplicationCommandDataResolvable
}