interface User{
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

function createUser(id: number, name: string, email?: string, isActive: boolean = true) : User{
    return {
        id,
        name,
        email,
        isActive
    };
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