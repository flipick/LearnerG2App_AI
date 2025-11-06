export function secondsToIsoDuration(sec:number) {
    var sec_num = parseInt(sec.toString(), 10); // don't forget the second param

    let hours:string | number= Math.floor(sec_num / 3600);
    let minutes:string | number= Math.floor((sec_num - hours * 3600) / 60);
    let seconds:string | number= sec_num - (hours as number) * 3600 - (minutes as number) * 60;

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    var t = 'PT' + (hours != "00" ? hours + 'H' : '') + (minutes != "00" ? minutes + 'M' : '') + (seconds != "00" ? seconds + 'S' : '');
    console.log("time in second : " + sec);
    console.log("ISO801 time: " + t);
    return t;
}