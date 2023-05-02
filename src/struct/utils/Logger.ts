import colors from 'colors'

export default class Logger {
    readonly console = console.log

    log(text: any) {
        return this.console(colors.yellow(`[LOG]`) + ' ' + String(text))
    }

    error(text: any) {
        this.console(colors.red(`[ERROR]`) + ' ' + String(text))
        return process.exit(0)
    }

    success(text: any) {
        return this.console(colors.green(`[SUCCESS]`) + ' ' + String(text))
    }

    login(text: any) {
        return this.console(colors.blue(`[LOGIN]`) + ' ' + String(text))
    }
}