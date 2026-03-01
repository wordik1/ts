import { readFile, writeFile } from "node:fs/promises";


function csvToJSON(input: string[], delimiter: string) : object[]{
    if(!Array.isArray(input) || input.length === 0){
        throw new Error("Неверный ввод!")
    }

    if(typeof delimiter !== 'string' || delimiter.length === 0){
        throw new Error("Неверный разделитель!");
    }

    const headers: string[] = input[0].split(delimiter);
    
    if(headers.length === 0 || headers.some(h => h.trim() === '')){
        throw new Error("Неверные названия столбцов: найден пустой заголовок");
    }

    const result: object[] = [];
    for(let i = 1; i < input.length; i++){
        const values: string[] = input[i].split(delimiter);
        const obj: { [key: string]: any } = {};
        for(let j = 0; j < headers.length; j++){
            const header: string = headers[j];
            const value: string = values[j];

            obj[header] = value;
        }
        result.push(obj);
    }
    return result;
}

let res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ';');
console.log(res);

async function formatCSVFileToJSONFile(input: string, output: string, delimiter: string): Promise<void>{
    const csv = await readFile(input, "utf8");

    const line = csv.split(/\r?\n/);
    if(line.length === 0){
        throw new Error("Таблица пустая!");
    }

    const jsonArr = csvToJSON(line, delimiter);
    const json = JSON.stringify(jsonArr, null, 2);

    writeFile(output, json, 'utf8');
}