import { Guild } from 'discord.js'
import { Player } from 'lavacord'
import Queue from '@customTypes/struct/queue/Queue'

interface XuiZnaet {
    equalizer?: any[],
    timescale?: any,
    rotation?: any,
    vibrato?: any,
    tremolo?: any,
    karaoke?: any
}

async function send(guild: Guild, player: Player, op: any, data: XuiZnaet) {
    if(!data?.equalizer) {
        const obj = {...data, equalizer: createBassData('none')}
        player.node.send({...obj, op, guildId: guild.id})
    } else {
        player.node.send({...data, op, guildId: guild.id})
    }
}

async function clearEffects(queue: Queue) {
    queue.filters._8d = false
    queue.filters.vibrato = false
    queue.filters.nightcore = false
    queue.filters.vaporwave = false
    queue.filters.speed = false
    queue.filters.tremolo = false
    queue.filters.vibrate = false
    queue.filters.china = false
    queue.filters.slowmotion = false
    queue.filters.karaoke = false
    queue.filters.bassHigh = false
    queue.filters.bassMedium = false
    queue.filters.bassLow = false
}

function createBassData(level: string) {
    interface IString {
        [key: string]: number
    }
    const levels: IString = {
        'none': 0.0,
        'low': 0.20,
        'medium': 0.35,
        'high': 0.50,
    }
    return new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }))
}

interface IBoostFilter {
    description: string,
    value: string,
    start: (guild: Guild, player: Player, queue: Queue) => Promise<any>
}

export const boostFilter: IBoostFilter[] = [
    {
        description: 'Вы очистили фильтр басса',
        value: 'clear',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {
                equalizer: createBassData('none')
            }
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.bassHigh = false
            queue.filters.bassMedium = false
            queue.filters.bassLow = false
        }
    },
    {
        description: 'Вы включили минимальный басс буст',
        value: 'low',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {
                equalizer: createBassData('low')
            }
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.bassLow = true
        }
    },
    {
        description: 'Вы включили средний басс буст',
        value: 'medium',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {
                equalizer: createBassData('medium')
            }
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.bassMedium = true
        }
    },
    {
        description: 'Вы включили высокий басс буст',
        value: 'high',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {
                equalizer: createBassData('high')
            }
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.bassHigh = true
        }
    }
]
export const defaultFilters = {
    vaporwave: false,
    nightcore: false,
    _8d: false,
    vibrato: false,
    tremolo: false,
    vibrate: false,
    china: false,
    speed: false,
    slowmotion: false,
    karaoke: false,
    bassHigh: false,
    bassMedium: false,
    bassLow: false
}

export default [
    {
        name: 'Vaporwave',
        value: 'vaporwave',
        check: 'vaporwave',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: { pitch: 0.800000011920929, rate: 1, speed: 0.8500000238418579 }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.vaporwave = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: null}
            send(guild, player, 'filters', filters)
            queue.filters.vaporwave = false
        }
    },
    {
        name: '8D',
        value: '8d',
        check: '_8d',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {rotation: { rotationHz: 0.2 }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters._8d = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {rotation: null}
            send(guild, player, 'filters', filters)
            queue.filters._8d = false
        }
    },
    {
        name: 'Vibrato',
        value: 'vibrato',
        check: 'vibrato',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {vibrato: {frequency: 4.0, depth: 0.75}}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.vibrato = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {vibrato: null}
            send(guild, player, 'filters', filters)
            queue.filters.vibrato = false
        }
    },
    {
        name: 'Vibrate',
        value: 'vibrate',
        check: 'vibrate',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {vibrato: {frequency: 4.0, depth: 0.75}, tremolo: { frequency: 4.0, depth: 0.75 }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.vibrate = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {vibrato: null, tremolo: null}
            send(guild, player, 'filters', filters)
            queue.filters.vibrate = false
        }
    },
    {
        name: 'Speed',
        value: 'speed',
        check: 'speed',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: {speed: Math.max(Math.min(1.6, 5), 0.05), pitch: 1.5, rate: 1 }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.speed = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: null}
            send(guild, player, 'filters', filters)
            queue.filters.speed = false
        }
    },
    {
        name: 'Nightcore',
        value: 'nightcore',
        check: 'nightcore',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: { pitch: 1.2999999523162842, rate: 1, speed: 1.2999999523162842}}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.nightcore = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: null}
            send(guild, player, 'filters', filters)
            queue.filters.nightcore = false
        }
    },
    {
        name: 'Tremolo',
        value: 'tremolo',
        check: 'tremolo',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {tremolo: { frequency: 10, depth: 0.5}}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.tremolo = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {tremolo: null}
            send(guild, player, 'filters', filters)
            queue.filters.tremolo = false
        }
    },
    {
        name: 'SlowMotion',
        value: 'slowmotion',
        check: 'slowmotion',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: { speed: 0.6, pitch: 1.00, rate: 0.8  }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.slowmotion = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: null}
            send(guild, player, 'filters', filters)
            queue.filters.slowmotion = false
        }
    },
    {
        name: 'Сhina',
        value: 'china',
        check: 'china',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: { speed: 0.75, pitch: 1.25, rate: 1.25  }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.china = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {timescale: null}
            send(guild, player, 'filters', filters)
            queue.filters.china = false
        }
    },
    {
        name: 'Karaoke',
        value: 'karaoke',
        check: 'karaoke',
        start: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 }}
            send(guild, player, 'filters', filters)
            clearEffects(queue)
            queue.filters.karaoke = true
        },
        end: async (guild: Guild, player: Player, queue: Queue) => {
            const filters = {karaoke: null}
            send(guild, player, 'filters', filters)
            queue.filters.karaoke = false
        }
    }
]