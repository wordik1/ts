"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createUser(id, name, email, isActive = true) {
    return {
        id,
        name,
        email,
        isActive
    };
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
//# sourceMappingURL=main.js.map