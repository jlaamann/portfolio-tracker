import { useState } from 'react';
import {
    Box,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    SimpleGrid,
} from '@chakra-ui/react';

interface AddPositionFormProps {
    onSubmit: (data: {
        ticker: string;
        shares: number;
        buy_price: number;
        currency: string;
    }) => Promise<void>;
}

export const AddPositionForm = ({ onSubmit }: AddPositionFormProps) => {
    const [formData, setFormData] = useState({
        ticker: '',
        shares: '',
        buy_price: '',
        currency: 'USD',
    });

    const handleFormChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                ticker: formData.ticker.toUpperCase(),
                shares: parseFloat(formData.shares),
                buy_price: parseFloat(formData.buy_price),
                currency: formData.currency,
            });

            setFormData({
                ticker: '',
                shares: '',
                buy_price: '',
                currency: 'USD',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} p={{ base: 3, md: 5 }} shadow="md" borderWidth="1px" borderRadius="md">
            <VStack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                    <FormControl isRequired>
                        <FormLabel>Ticker Symbol</FormLabel>
                        <Input
                            value={formData.ticker}
                            onChange={(e) => handleFormChange('ticker', e.target.value)}
                            placeholder="e.g., AAPL"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Number of Shares</FormLabel>
                        <NumberInput
                            value={formData.shares}
                            onChange={(value) => handleFormChange('shares', value)}
                            precision={4}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Average Price</FormLabel>
                        <NumberInput
                            value={formData.buy_price}
                            onChange={(value) => handleFormChange('buy_price', value)}
                            min={0}
                            precision={2}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Currency</FormLabel>
                        <Select
                            value={formData.currency}
                            onChange={(e) => handleFormChange('currency', e.target.value)}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                        </Select>
                    </FormControl>
                </SimpleGrid>

                <Button type="submit" colorScheme="blue" width="full">
                    Add Position
                </Button>
            </VStack>
        </Box>
    );
}; 