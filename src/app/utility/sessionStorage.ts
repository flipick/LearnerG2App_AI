
export function set(key:any,value:any){
    if(typeof key!="string"){
        return;
    }
    sessionStorage.setItem(key,JSON.stringify(value));
}
export function get(key:any){
    var value:any=sessionStorage.getItem(key);
    if(typeof value == "string"){
        return JSON.parse(value);
       
    }
    else if(typeof value == "object"){
        return JSON.parse(value);
    }
    else{
        return "";
    }
}

export function remove(key:any){
    sessionStorage.removeItem(key);
}