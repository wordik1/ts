"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
function makeWhere(key, value) {
    return function (data) { return data.filter(function (item) { return item[key] === value; }); };
}
function makeGroupBy(key) {
    return function (data) {
        var map = new Map();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var item = data_1[_i];
            var k = item[key];
            if (!map.has(k))
                map.set(k, []);
            map.get(k).push(item);
        }
        return Array.from(map.entries()).map(function (_a) {
            var k = _a[0], items = _a[1];
            return ({ key: k, items: items });
        });
    };
}
function makeHaving(predicate) {
    return function (groups) { return groups.filter(predicate); };
}
function makeSortGroup(key) {
    return function (groups) {
        return __spreadArray([], groups, true).sort(function (a, b) {
            var va = a.key;
            var vb = b.key;
            if (va < vb)
                return -1;
            if (va > vb)
                return 1;
            return 0;
        });
    };
}
function query() {
    var steps = [];
    var builder = {
        where: function (key, value) {
            steps.push({ kind: 'row', fn: makeWhere(key, value) });
            return builder;
        },
        groupBy: function (key) {
            steps.push({ kind: 'rowToGroup', fn: makeGroupBy(key) });
            return builder;
        },
        having: function (predicate) {
            steps.push({ kind: 'group', fn: makeHaving(predicate) });
            return builder;
        },
        sort: function (key) {
            steps.push({ kind: 'group', fn: makeSortGroup(key) });
            return builder;
        },
        execute: function (data) {
            var result = data;
            for (var _i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
                var step = steps_1[_i];
                result = step.fn(result);
            }
            return result;
        },
    };
    return builder;
}
var users = [
    { name: 'Alice', age: 30, city: 'Moscow', salary: 100000 },
    { name: 'Charlie', age: 25, city: 'Moscow', salary: 80000 },
    { name: 'Bob', age: 35, city: 'SPb', salary: 120000 },
    { name: 'David', age: 28, city: 'SPb', salary: 90000 },
    { name: 'Frank', age: 32, city: 'Moscow', salary: 110000 },
];
var result1 = query()
    .where('city', 'Moscow')
    .groupBy('city')
    .having(function (group) { return group.items.length > 0; })
    .sort('city')
    .execute(users);
var result2 = query()
    .where('age', 30)
    .execute(users);
var result3 = query()
    .where('salary', 100000)
    .groupBy('city')
    .having(function (group) { return group.items.length >= 1; })
    .execute(users);
