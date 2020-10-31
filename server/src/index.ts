import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import redis from 'redis'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { __prod__ } from './constants'
import microConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
const main = async () => {
	const orm = await MikroORM.init(microConfig)
	await orm.getMigrator().up()
	const app = express()
	const RedisStore = connectRedis(session)
	const redisClient = redis.createClient()
	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true,
		})
	)
	app.use(
		session({
			name: 'qid',
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
				httpOnly: true,
				sameSite: 'lax', //csrf
				secure: __prod__, //cookies only work in https
			},
			saveUninitialized: false,
			secret: 'jklkjmkk5jhjg',
			resave: false,
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({ em: orm.em, req, res }),
	})

	apolloServer.applyMiddleware({
		app,
		cors: false,
	})
	const port = 4000
	app.listen(port, () => {
		console.log(`server started on localhost:${port}`)
	})
}

main().catch((err) => {
	console.error(err)
})
