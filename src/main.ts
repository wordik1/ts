interface User{
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

export function createUser(id: number, name: string, email?: string, isActive: boolean = true) : User{
    const user: User = {
        id,
        name,
        isActive
    };

    if (email !== undefined){
        user.email = email;
    }

    return user;
}

export interface Book{
    title: string;
    author: string;
    year?: number;
    genre: 'fiction' | 'non-fiction';
}

export function createBook(book: Book) : Book{
    return book;
}

const book1: Book = {
    title: "Биба",
    author: "Боба",
    year: 1488,
    genre: 'non-fiction'
};

const result1 = createBook(book1);
console.log("Книга с year: ", result1);

const book2: Book = {
    title: "Пупа",
    author: "Лупа",
    genre: 'fiction'
};

const result2 = createBook(book2);
console.log("Книга без year: ", result2);

export function calculateArea(shape: 'circle', radius: number): number;
export function calculateArea(shape: 'square', side: number): number;

export function calculateArea(shape: 'circle' | 'square', param: number): number{
    switch (shape){
        case 'circle':
            return Math.PI * Math.pow(param, 2);

        case 'square':
            return param * param;
    }
}

console.log(calculateArea("circle", 3));
console.log(calculateArea("square", 12));

export type Status = 'active' | 'inactive' | 'new';

export function getStatusColor(status: Status): string{
    switch(status){
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

type stringFormatter = (str: string, uppercase?: boolean) => string;

export const upperFirst: stringFormatter = (str: string, uppercase: boolean = false): string => {
    if(str.length === 0) return str;

    const result = str.charAt(0).toUpperCase() + str.slice(1);

    return uppercase ? result.toUpperCase() : result;
};

export const trimSpaces: stringFormatter = (str: string, uppercase: boolean = false): string => {
    if(str.length === 0) return str;

    const result = str.trim();

    return uppercase ? result.toUpperCase() : result;
}

console.log(`"hello world" -> ${upperFirst("hello world")}`);
console.log(`"hello world", true -> ${upperFirst("hello world", true)}`);
console.log(`"  hello world  " -> "${trimSpaces("  hello world  ")}"`); 
console.log(`"  hello world  ", true -> "${trimSpaces("  hello world  ", true)}"`);

export function getFirstElement<T>(arr: T[]): T | undefined{
    return arr.length > 0 ? arr[0] : undefined;
}

const numArray: number[] = [1, 2, 5, 6, 14];
console.log(`первый элемент(числа): ${getFirstElement(numArray)}`);
const strArray: string[] = ["бим", "бам", "бум"];
console.log(`первый элемент(строки): ${getFirstElement(strArray)}`);
const emptyArray: number[] = [];
console.log(`пустой массив: ${getFirstElement(emptyArray)}`);

interface HasId{
    id: number;
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined{
    return items.find(item => item.id === id);
}

const Users = [
    {id: 1, name: "Name"},
    {id: 2, name: "eshyo Name"}
];

console.log(findById(Users, 2));