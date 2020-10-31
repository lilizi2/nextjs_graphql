import { Box, Button, Flex, Link } from '@chakra-ui/core'
import NextLink from 'next/link'
import React from 'react'
import { useMeQuery } from '../generated/graphql'
interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
	const [{ data, fetching }] = useMeQuery()

	let body = null
	//Data is loading
	if (fetching) {
	}
	//User is not logged in
	else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link mr={2}>Login</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link>register</Link>
				</NextLink>
			</>
		)
	} else {
		body = (
			<Flex>
				<Box mr={2}>{data?.me?.user?.username}</Box>
				<Button variant='link'>logout</Button>
			</Flex>
		)
	}
	console.log(data?.me)
	console.log(fetching)
	return (
		<Flex bg='tomato' p={4}>
			<Box ml={'auto'}>{body}</Box>
		</Flex>
	)
}
