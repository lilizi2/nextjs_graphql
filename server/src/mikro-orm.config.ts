import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { Post } from '../entities/Post'
import { User } from './../entities/User'
import { __prod__ } from './constants'
console.log('dirname: ', __dirname)

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	dbName: 'lireddit',
	type: 'postgresql',
	debug: !__prod__,
	entities: [Post, User],
	user: 'lilizi',
	password: 'lilizi',
} as Parameters<typeof MikroORM.init>[0]
// as const ---- more specific --- user:'lilizi'
// as Parameters<typeof functionname> [0] <----- functionname(xxx:???)
