import { CSSReset, ThemeProvider } from '@chakra-ui/core'
import { Cache, cacheExchange, QueryInput } from '@urql/exchange-graphcache'
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql'
import { MeDocument } from '../generated/graphql'
import theme from '../theme'

function betterUpdateQuery<Result,Query>(cache:Cache,qi:QueryInput,result:any,fn:(r:Result,q:Query)=>Query){

}

const client = createClient({
	url: 'http://localhost:4000/graphql',
	fetchOptions: {
		credentials: 'include',
	},
	exchanges: [dedupExchange, cacheExchange({
		updates:{
			Mutation:{
				login:(result,args,cache,info){
					cache.updateQuery({query:MeDocument},data=>{
						
					})
				}
			}
		}
	}), fetchExchange],
})

function MyApp({ Component, pageProps }) {
	return (
		<Provider value={client}>
			<ThemeProvider theme={theme}>
				{/* <ColorModeProvider> */}
				<CSSReset />
				<Component {...pageProps} />
				{/* </ColorModeProvider> */}
			</ThemeProvider>
		</Provider>
	)
}

export default MyApp
