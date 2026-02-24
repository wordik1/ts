interface User{
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

function createUser(id: number, name: string, email?: string, isActive: boolean = true) : User{
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

interface Book{
    title: string;
    author: string;
    year?: number;
    genre: 'fiction' | 'non-fiction';
}

function createBook(book: Book) : Book{
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

function calculateArea(shape: 'circle', radius: number): number;
function calculateArea(shape: 'square', side: number): number;

function calculateArea(shape: 'circle' | 'square', param: number): number{
    switch (shape){
        case 'circle':
            return Math.PI * Math.pow(param, 2);

        case 'square':
            return param * param;
    }
}

console.log(calculateArea("circle", 3));
