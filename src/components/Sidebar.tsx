import { Box, VStack, Button, useColorModeValue } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const activeBgColor = useColorModeValue('blue.200', 'blue.600');

    return (
        <Box
            w="200px"
            h="100vh"
            bg={bgColor}
            p={4}
            position="fixed"
            left={0}
            top={0}
        >
            <VStack spacing={4} align="stretch">
                <Button
                    as={Link}
                    to="/"
                    colorScheme={location.pathname === '/' ? 'blue' : 'gray'}
                    variant={location.pathname === '/' ? 'solid' : 'ghost'}
                    justifyContent="flex-start"
                >
                    Stock Price
                </Button>
                <Button
                    as={Link}
                    to="/portfolio"
                    colorScheme={location.pathname === '/portfolio' ? 'blue' : 'gray'}
                    variant={location.pathname === '/portfolio' ? 'solid' : 'ghost'}
                    justifyContent="flex-start"
                >
                    Portfolio
                </Button>
            </VStack>
        </Box>
    );
};

export default Sidebar; 