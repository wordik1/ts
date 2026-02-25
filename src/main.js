"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimSpaces = exports.upperFirst = void 0;
exports.createUser = createUser;
exports.createBook = createBook;
exports.calculateArea = calculateArea;
exports.getStatusColor = getStatusColor;
exports.getFirstElement = getFirstElement;
exports.findById = findById;
function createUser(id, name, email, isActive) {
    if (isActive === void 0) { isActive = true; }
    var user = {
        id: id,
        name: name,
        isActive: isActive
    };
    if (email !== undefined) {
        user.email = email;
    }
    return user;
}
function createBook(book) {
    return book;
}
var book1 = {
    title: "Биба",
    author: "Боба",
    year: 1488,
    genre: 'non-fiction'
};
var result1 = createBook(book1);
console.log("Книга с year: ", result1);
var book2 = {
    title: "Пупа",
    author: "Лупа",
    genre: 'fiction'
};
var result2 = createBook(book2);
console.log("Книга без year: ", result2);
function calculateArea(shape, param) {
    switch (shape) {
        case 'circle':
            return Math.PI * Math.pow(param, 2);
        case 'square':
            return param * param;
    }
}
console.log(calculateArea("circle", 3));
console.log(calculateArea("square", 12));
function getStatusColor(status) {
    switch (status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'gray';
        case 'new':
            return 'blue';
    }
}
var activeColor = getStatusColor('active');
console.log("color active: ".concat(activeColor));
var inactiveColor = getStatusColor('inactive');
console.log("color inactive: ".concat(inactiveColor));
var newColor = getStatusColor('new');
console.log("color new: ".concat(newColor));
var upperFirst = function (str, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    if (str.length === 0)
        return str;
    var result = str.charAt(0).toUpperCase() + str.slice(1);
    return uppercase ? result.toUpperCase() : result;
};
exports.upperFirst = upperFirst;
var trimSpaces = function (str, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    if (str.length === 0)
        return str;
    var result = str.trim();
    return uppercase ? result.toUpperCase() : result;
};
exports.trimSpaces = trimSpaces;
console.log("\"hello world\" -> ".concat((0, exports.upperFirst)("hello world")));
console.log("\"hello world\", true -> ".concat((0, exports.upperFirst)("hello world", true)));
console.log("\"  hello world  \" -> \"".concat((0, exports.trimSpaces)("  hello world  "), "\""));
console.log("\"  hello world  \", true -> \"".concat((0, exports.trimSpaces)("  hello world  ", true), "\""));
function getFirstElement(arr) {
    return arr.length > 0 ? arr[0] : undefined;
}
var numArray = [1, 2, 5, 6, 14];
console.log("\u043F\u0435\u0440\u0432\u044B\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442(\u0447\u0438\u0441\u043B\u0430): ".concat(getFirstElement(numArray)));
var strArray = ["бим", "бам", "бум"];
console.log("\u043F\u0435\u0440\u0432\u044B\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442(\u0441\u0442\u0440\u043E\u043A\u0438): ".concat(getFirstElement(strArray)));
var emptyArray = [];
console.log("\u043F\u0443\u0441\u0442\u043E\u0439 \u043C\u0430\u0441\u0441\u0438\u0432: ".concat(getFirstElement(emptyArray)));
function findById(items, id) {
    return items.find(function (item) { return item.id === id; });
}
var User = [
    { id: 1, name: "Name" },
    { id: 2, name: "eshyo Name" },
    { id: 5, name: "Hih" },
    { id: 24, name: "Huh" }
];
console.log(findById(User, 5));
