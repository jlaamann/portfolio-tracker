import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    VStack,
    Input,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useToast,
    HStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '../db/setup';

interface WatchlistEntry {
    id: number;
    ticker: string;
    created_at: Date;
}

const Watchlist = () => {
    const [ticker, setTicker] = useState('');
    const [entries, setEntries] = useState<WatchlistEntry[]>([]);
    const toast = useToast();

    const loadWatchlist = async () => {
        try {
            const watchlist = await getWatchlist();
            setEntries(watchlist);
        } catch (error) {
            toast({
                title: 'Error loading watchlist',
                status: 'error',
                duration: 2000,
            });
        }
    };

    useEffect(() => {
        loadWatchlist();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticker.trim()) return;

        try {
            await addToWatchlist(ticker.trim());
            setTicker('');
            loadWatchlist();
            toast({
                title: 'Ticker added to watchlist',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: error instanceof Error ? error.message : 'Error adding ticker',
                status: 'error',
                duration: 2000,
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await removeFromWatchlist(id);
            loadWatchlist();
            toast({
                title: 'Ticker removed from watchlist',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Error removing ticker',
                status: 'error',
                duration: 2000,
            });
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <Box p={{ base: 2, md: 5 }}>
            <VStack spacing={8} align="stretch">
                <Heading size="lg" textAlign="center">Watchlist</Heading>

                <Box as="form" onSubmit={handleSubmit}>
                    <HStack>
                        <Input
                            placeholder="Enter ticker symbol (e.g., AAPL)"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        />
                        <Button type="submit" colorScheme="blue">
                            Add to Watchlist
                        </Button>
                    </HStack>
                </Box>

                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Ticker</Th>
                            <Th>Date Added</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {entries.map((entry) => (
                            <Tr key={entry.id}>
                                <Td>{entry.ticker}</Td>
                                <Td>{formatDate(entry.created_at)}</Td>
                                <Td>
                                    <IconButton
                                        aria-label="Remove from watchlist"
                                        icon={<DeleteIcon />}
                                        colorScheme="red"
                                        size="sm"
                                        onClick={() => handleDelete(entry.id)}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </VStack>
        </Box>
    );
};

export default Watchlist; 