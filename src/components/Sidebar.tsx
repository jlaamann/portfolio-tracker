import { Box, VStack, Button, useColorModeValue, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useBreakpointValue } from '@chakra-ui/react';

const Sidebar = () => {
    const location = useLocation();
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMobile = useBreakpointValue({ base: true, md: false });

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
            w="200px"
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