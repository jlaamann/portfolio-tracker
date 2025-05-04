import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PortfolioDB extends DBSchema {
    portfolio: {
        key: number;
        value: {
            id: number;
            ticker: string;
            shares: number;
            buy_price: number;
            currency: string;
            created_at: Date;
        };
        indexes: {
            'by-ticker': string;
        };
    };
}

let db: IDBPDatabase<PortfolioDB> | null = null;

export const initDB = async () => {
    if (db) return db;

    db = await openDB<PortfolioDB>('portfolio-db', 1, {
        upgrade(db) {
            const store = db.createObjectStore('portfolio', {
                keyPath: 'id',
                autoIncrement: true,
            });
            store.createIndex('by-ticker', 'ticker');
        },
    });

    return db;
};

export const getDB = async () => {
    if (!db) {
        await initDB();
    }
    return db!;
};

export const addPosition = async (position: Omit<PortfolioDB['portfolio']['value'], 'id' | 'created_at'>) => {
    const db = await getDB();
    return db.add('portfolio', {
        ...position,
        created_at: new Date(),
    });
};

export const getAllPositions = async () => {
    const db = await getDB();
    return db.getAll('portfolio');
};

export const deletePosition = async (id: number) => {
    const db = await getDB();
    return db.delete('portfolio', id);
}; 