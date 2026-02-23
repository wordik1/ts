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