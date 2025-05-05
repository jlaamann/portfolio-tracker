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

export const getPositionByTicker = async (ticker: string) => {
    const db = await getDB();
    const tx = db.transaction('portfolio', 'readonly');
    const index = tx.store.index('by-ticker');
    const positions = await index.getAll(ticker);
    return positions[0]; // Return the first matching position
};

export const updatePosition = async (id: number, position: Partial<PortfolioDB['portfolio']['value']>) => {
    const db = await getDB();
    const existingPosition = await db.get('portfolio', id);
    if (!existingPosition) {
        throw new Error('Position not found');
    }
    return db.put('portfolio', {
        ...existingPosition,
        ...position,
    });
};

type NewPosition = Omit<PortfolioDB['portfolio']['value'], 'id' | 'created_at'>;

export const addPosition = async (position: NewPosition) => {
    const db = await getDB();
    const existingPosition = await getPositionByTicker(position.ticker);

    if (existingPosition) {
        // Calculate new average price and total shares
        const totalShares = existingPosition.shares + position.shares;
        const totalValue = (existingPosition.shares * existingPosition.buy_price) + (position.shares * position.buy_price);
        const averagePrice = Number((totalValue / totalShares).toFixed(2));

        // Update existing position
        return updatePosition(existingPosition.id, {
            shares: totalShares,
            buy_price: averagePrice,
        });
    }

    // Add new position
    return db.add('portfolio', {
        ...position,
        created_at: new Date(),
    } as PortfolioDB['portfolio']['value']);
};

export const getAllPositions = async () => {
    const db = await getDB();
    return db.getAll('portfolio');
};

export const deletePosition = async (id: number) => {
    const db = await getDB();
    return db.delete('portfolio', id);
}; 