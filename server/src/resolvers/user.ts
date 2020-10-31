import { EntityManager } from '@mikro-orm/postgresql'
import argon2 from 'argon2'
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from 'type-graphql'
import { User } from './../../entities/User'
import { MyContext } from './../types'
@InputType()
class UsernamePasswordInput {
	@Field()
	username: string
	@Field()
	password: string
}

@ObjectType()
class FieldError {
	@Field()
	field: string
	@Field()
	message: string
}
@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]

	@Field(() => User, { nullable: true })
	user?: User
}
@Resolver()
export class UserResolver {
	@Query(() => UserResponse, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		console.log('session: ', req.session)

		if (!req.session.userId) {
			return null
		}
		const user = await em.findOne(User, { id: req.session.userId })
		if (!user) {
			return {
				errors: [
					{
						field: 'username',
						message: "that username doesn't exist",
					},
				],
			}
		}
		return { user }
	}
	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: 'username',
						message: 'length must me greater than 2',
					},
				],
			}
		}
		if (options.password.length <= 3) {
			return {
				errors: [
					{
						field: 'password',
						message: 'length must me greater than 3',
					},
				],
			}
		}
		const hashedPassword = await argon2.hash(options.password)
		// const user = em.create(User, {
		// 	username: options.username,
		// 	password: hashedPassword,
		// })
		// await em.persistAndFlush(user)
		let user
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
					password: hashedPassword,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning('*')
			user = result[0]
		} catch (error) {
			if (error.detail.includes('already exists')) {
				//duplicate username error
				return {
					errors: [
						{
							field: 'username',
							message: 'username already been taken',
						},
					],
				}
			}
		}
		console.log('i am user: ', user)
		req.session.userId = user.id
		return { user }
	}
	@Mutation(() => UserResponse)
	async login(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username })
		if (!user) {
			return {
				errors: [
					{
						field: 'username',
						message: "that username doesn't exist",
					},
				],
			}
		} else {
			const valid = await argon2.verify(user.password, options.password)
			if (!valid) {
				return {
					errors: [
						{
							field: 'password',
							message: 'incorrect password',
						},
					],
				}
			}
			req.session.userId = user.id
			req.session.randomKey = 'lilizi is cool'
			return {
				user,
			}
		}
	}
}
