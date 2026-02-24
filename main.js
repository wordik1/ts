"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createUser(id, name, email, isActive = true) {
    const user = {
        id,
        name,
        isActive
    };
    if (email !== undefined) {
        user.email = email;
    }
    return user;
}
function createBook(book) {
    return book;
}
const book1 = {
    title: "Биба",
    author: "Боба",
    year: 1488,
    genre: 'non-fiction'
};
const result1 = createBook(book1);
console.log("Книга с year: ", result1);
const book2 = {
    title: "Пупа",
    author: "Лупа",
    genre: 'fiction'
};
const result2 = createBook(book2);
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
const activeColor = getStatusColor('active');
console.log(`color active: ${activeColor}`);
const inactiveColor = getStatusColor('inactive');
console.log(`color inactive: ${inactiveColor}`);
const newColor = getStatusColor('new');
console.log(`color new: ${newColor}`);
const upperFirst = (str, uppercase = false) => {
    if (str.length === 0)
        return str;
    const result = str.charAt(0).toUpperCase() + str.slice(1);
    return uppercase ? result.toUpperCase() : result;
};
const trimSpaces = (str, uppercase = false) => {
    if (str.length === 0)
        return str;
    const result = str.trim();
    return uppercase ? result.toUpperCase() : result;
};
console.log(`"hello world" -> ${upperFirst("hello world")}`);
console.log(`"hello world", true -> ${upperFirst("hello world", true)}`);
console.log(`"  hello world  " -> "${trimSpaces("  hello world  ")}"`);
console.log(`"  hello world  ", true -> "${trimSpaces("  hello world  ", true)}"`);
function getFirstElement(arr) {
    return arr.length > 0 ? arr[0] : undefined;
}
const numArray = [1, 2, 5, 6, 14];
console.log(`первый элемент(числа): ${getFirstElement(numArray)}`);
const strArray = ["бим", "бам", "бум"];
console.log(`первый элемент(строки): ${getFirstElement(strArray)}`);
const emptyArray = [];
console.log(`пустой массив: ${getFirstElement(emptyArray)}`);
function findById(items, id) {
    return items.find(item => item.id === id);
}
const Users = [
    { id: 1, name: "Name" },
    { id: 2, name: "eshyo Name" }
];
console.log(findById(Users, 2));
//# sourceMappingURL=main.js.map