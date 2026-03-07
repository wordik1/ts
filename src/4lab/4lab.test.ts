import { it, describe, expect } from 'vitest';
import { query } from './4lab.ts'

type User = {
    id: number;
    name: string;
    surname: string;
    age: number;
    city: string;
};

