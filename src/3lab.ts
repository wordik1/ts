function csvToJSON(input: string, delimiter: string) : object[]{
    if(!Array.isArray(input) || input.length === 0){
        throw new Error("Неверный ввод!")
    }

    if(typeof delimiter !== 'string' || delimiter.length === 0){
        throw new Error("Неверный разделитель!");
    }

}