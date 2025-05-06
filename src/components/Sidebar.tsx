import { Box, VStack, Button, useColorModeValue, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useColorMode, Divider } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useBreakpointValue } from '@chakra-ui/react';

const Sidebar = () => {
    const location = useLocation();
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { colorMode, toggleColorMode } = useColorMode();

    const SidebarContent = () => (
        <VStack spacing={4} align="stretch">
            <Button
                as={Link}
                to="/"
                colorScheme={location.pathname === '/' ? 'blue' : 'gray'}
                variant={location.pathname === '/' ? 'solid' : 'ghost'}
                justifyContent="flex-start"
                onClick={isMobile ? onClose : undefined}
                _hover={{
                    bg: location.pathname === '/' ? 'blue.400' : undefined,
                    color: location.pathname === '/' ? 'white' : undefined
                }}
            >
                Stock Price Lookup
            </Button>
            <Button
                as={Link}
                to="/historical"
                colorScheme={location.pathname === '/historical' ? 'blue' : 'gray'}
                variant={location.pathname === '/historical' ? 'solid' : 'ghost'}
                justifyContent="flex-start"
                onClick={isMobile ? onClose : undefined}
                _hover={{
                    bg: location.pathname === '/historical' ? 'blue.400' : undefined,
                    color: location.pathname === '/historical' ? 'white' : undefined
                }}
            >
                Historical Price Lookup
            </Button>
            <Button
                as={Link}
                to="/portfolio"
                colorScheme={location.pathname === '/portfolio' ? 'blue' : 'gray'}
                variant={location.pathname === '/portfolio' ? 'solid' : 'ghost'}
                justifyContent="flex-start"
                onClick={isMobile ? onClose : undefined}
                _hover={{
                    bg: location.pathname === '/portfolio' ? 'blue.400' : undefined,
                    color: location.pathname === '/portfolio' ? 'white' : undefined
                }}
            >
                Portfolio
            </Button>
            <Button
                as={Link}
                to="/watchlist"
                colorScheme={location.pathname === '/watchlist' ? 'blue' : 'gray'}
                variant={location.pathname === '/watchlist' ? 'solid' : 'ghost'}
                justifyContent="flex-start"
                onClick={isMobile ? onClose : undefined}
                _hover={{
                    bg: location.pathname === '/watchlist' ? 'blue.400' : undefined,
                    color: location.pathname === '/watchlist' ? 'white' : undefined
                }}
            >
                Watchlist
            </Button>
            <Divider my={2} />
            <Button
                leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                justifyContent="flex-start"
            >
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
        </VStack>
    );

    if (isMobile) {
        return (
            <>
                <IconButton
                    aria-label="Open menu"
                    icon={<HamburgerIcon />}
                    position="fixed"
                    top={4}
                    left={4}
                    zIndex={1000}
                    onClick={onOpen}
                />
                <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Menu</DrawerHeader>
                        <DrawerBody>
                            <SidebarContent />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    return (
        <Box
            w="250px"
            h="100vh"
            bg={bgColor}
            p={4}
            position="fixed"
            left={0}
            top={0}
        >
            <SidebarContent />
        </Box>
    );
};

export default Sidebar; 