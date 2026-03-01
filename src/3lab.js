function csvToJSON(input, delimiter) {
    if (!Array.isArray(input) || input.length === 0) {
        throw new Error("Неверный ввод!");
    }
    if (typeof delimiter !== 'string' || delimiter.length === 0) {
        throw new Error("Неверный разделитель!");
    }
    var headers = input[0].split(delimiter);
    if (headers.length === 0 || headers.some(function (h) { return h.trim() === ''; })) {
        throw new Error("Неверные названия столбцов: найден пустой заголовок");
    }
    var result = [];
    for (var i = 1; i < input.length; i++) {
        var values = input[i].split(delimiter);
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            var header = headers[j];
            var value = values[j];
            obj[header] = value;
        }
        result.push(obj);
    }
    return result;
}
var res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ';');
console.log(res);
