export function emailChecker(value: string) {
    return function (checker: (val: string) => boolean) {
        return checker(value)
    }
}

export function xpEmail(value:string){
    const emailRegex: RegExp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    return emailRegex.test(value)
}