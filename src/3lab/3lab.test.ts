import { it, describe, assert, beforeEach, afterEach, vi, expect } from 'vitest';
import { csvToJSON, formatCSVFileToJSONFile } from './3lab.ts';
import * as fs from 'node:fs/promises';

describe('проверка конвертации csv в json:', () => {
    describe('корректные входные данные:', () => {
        it('csv to json', () => {
            const input = ["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"];
            const expected = [
                { p1: '1', p2: 'A', p3: 'b', p4: 'c' },
                { p1: '2', p2: 'B', p3: 'v', p4: 'd' }
            ];
            const result = csvToJSON(input, ';');
            assert.deepEqual(result, expected);
        });

        it('разные разделители:', () => {
            const input = ["Имя,Возраст,Город", "Петя,25,Нью Йорк", "Вова,10,Мурино"];
            const expected = [
                { Имя: "Петя", Возраст: "25", Город: "Нью Йорк" },
                { Имя: "Вова", Возраст: "10", Город: "Мурино" }
            ]
            const result = csvToJSON(input, ',');
            assert.deepEqual(result, expected);
        });
    });

    describe('некорректные входные данные:', () => {
        it('при пустом массиве:', () => {
            assert.throws(() => csvToJSON([], ';'), "Неверный ввод!");
        })
        it('при пустом столбце:', () => {
            assert.throws(() => csvToJSON(["p1;;p3;p4", "1;A;b;c", "2;B;v;d"], ';'), "Неверные названия столбцов: найден пустой заголовок");
        })
        it('при пустом столбце:', () => {
            assert.throws(() => csvToJSON(["", "1;A;b;c", "2;B;v;d"], ';'), "Неверные названия столбцов: найден пустой заголовок");
        })
    })
})

vi.mock('node:fs/promises', {spy: true});

describe('проверка считывания и создания файла:', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    afterEach(() => { vi.resetAllMocks(); });

    describe('корректное преобразование:', () => {
        it('должен корректно преобразовать csv в JSON:', async () => {
            const csv = "Имя,Возраст,Город\nПетя,25,Нью Йорк\nВова,10,Мурино";
            vi.mocked(fs.readFile).mockResolvedValue(csv);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);

            await formatCSVFileToJSONFile('spreadsheet.csv', 'output.json', ',');

            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith('spreadsheet.csv', 'utf8');

            expect(fs.writeFile).toHaveBeenCalledTimes(1);
            const expectedJSON = JSON.stringify([
                { Имя: "Петя", Возраст: "25", Город: "Нью Йорк" },
                { Имя: "Вова", Возраст: "10", Город: "Мурино" }
            ], null, 2);
            expect(fs.writeFile).toHaveBeenCalledWith('output.json', expectedJSON, 'utf8');
        })
    })
})