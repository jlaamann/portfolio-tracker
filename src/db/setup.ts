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
    cash: {
        key: string;
        value: {
            key: string;
            amount: number;
            updated_at: Date;
        };
    };
}

let db: IDBPDatabase<PortfolioDB> | null = null;

export const initDB = async () => {
    if (db) return db;

    try {
        db = await openDB<PortfolioDB>('portfolio-db', 10, {
            upgrade(db, oldVersion, newVersion) {
                console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

                // Create portfolio store if it doesn't exist
                if (!db.objectStoreNames.contains('portfolio')) {
                    const store = db.createObjectStore('portfolio', {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    store.createIndex('by-ticker', 'ticker');
                }

                // Create cash store if it doesn't exist
                if (!db.objectStoreNames.contains('cash')) {
                    db.createObjectStore('cash', {
                        keyPath: 'key',
                    });
                }
            },
            blocked() {
                console.error('Database upgrade blocked');
            },
            blocking() {
                console.error('Database upgrade blocking');
            },
            terminated() {
                console.error('Database connection terminated');
                db = null;
            },
        });

        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
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

export const addPosition = async (position: NewPosition, isUpdate: boolean = false) => {
    // Validate shares is a positive number
    if (position.shares <= 0) {
        throw new Error('Shares must be a positive number');
    }

    const db = await getDB();
    const existingPosition = await getPositionByTicker(position.ticker);

    if (existingPosition && !isUpdate) {
        // Calculate new average price and total shares for adding to existing position
        const totalShares = existingPosition.shares + position.shares;
        const totalValue = (existingPosition.shares * existingPosition.buy_price) + (position.shares * position.buy_price);
        const averagePrice = Number((totalValue / totalShares).toFixed(2));

        // Update existing position
        return updatePosition(existingPosition.id, {
            shares: Number(totalShares.toFixed(4)), // Round to 4 decimal places
            buy_price: averagePrice,
        });
    }

    // Add new position or update existing one
    if (isUpdate && existingPosition) {
        return updatePosition(existingPosition.id, {
            shares: Number(position.shares.toFixed(4)), // Round to 4 decimal places
            buy_price: position.buy_price,
        });
    }

    // Add new position
    return db.add('portfolio', {
        ...position,
        shares: Number(position.shares.toFixed(4)), // Round to 4 decimal places
        created_at: new Date(),
    } as PortfolioDB['portfolio']['value']);
};

export const getAllPositions = async () => {
    try {
        const db = await getDB();
        const positions = await db.getAll('portfolio');
        return positions;
    } catch (error) {
        console.error('Failed to get all positions:', error);
        throw error;
    }
};

export const deletePosition = async (id: number) => {
    const db = await getDB();
    return db.delete('portfolio', id);
};

export const saveCashPosition = async (amount: number) => {
    const db = await getDB();
    return db.put('cash', {
        key: 'current',
        amount,
        updated_at: new Date()
    });
};

export const getCashPosition = async () => {
    const db = await getDB();
    const cashData = await db.get('cash', 'current');
    return cashData?.amount || 0;
}; 