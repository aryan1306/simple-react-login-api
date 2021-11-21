import { ApolloError } from "apollo-server-errors";
import { hash, verify } from "argon2";
import { sign } from "jsonwebtoken";
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	UseMiddleware,
} from "type-graphql";
import { emailReg } from "./constants";
import { MyContext } from "./context/MyContext";
import { isAuth } from "./middleware/isAuth";
import { UserClass, UserModel } from "./models/userModel";

@ObjectType()
class LoginResponse {
	@Field()
	accessToken: string;
}

@Resolver()
export class UserResolver {
	@Query(() => String)
	hello() {
		return "hi!!";
	}

	@Query(() => String)
	@UseMiddleware(isAuth)
	bye(@Ctx() { payload }: MyContext) {
		return `your userId is ${payload?.userId}`;
	}

	@Mutation(() => UserClass)
	async register(
		@Arg("name") name: string,
		@Arg("email") email: string,
		@Arg("password") password: string
	) {
		const existingUser = await UserModel.findOne({ email });
		if (existingUser) {
			throw new ApolloError("User with this email already exists");
		}
		if (!email.match(emailReg)) {
			throw new ApolloError("Please enter a valid E-mail");
		}
		if (password.length <= 8) {
			throw new ApolloError(
				"Length of password should be more than 8 characters"
			);
		}
		const hashedPassword = await hash(password);
		const user = await UserModel.create({
			name,
			email,
			password: hashedPassword,
		});
		await user.save();
		return user;
	}

	@Mutation(() => LoginResponse)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: MyContext
	): Promise<LoginResponse> {
		const user = await UserModel.findOne({ email });
		if (!user) {
			throw new ApolloError("Please enter the correct email/password");
		}
		const validPassword = await verify(user.password, password);
		if (!validPassword) {
			throw new ApolloError("Please enter the correct email/password");
		}
		//successfull login

		//refresh token

		res.cookie(
			"vID",
			sign({ userId: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET!, {
				expiresIn: "7d",
			}),
			{
				httpOnly: true,
			}
		);

		//access token
		return {
			accessToken: sign(
				{ userId: user._id.toString() },
				process.env.TOKEN_SECRET!,
				{
					expiresIn: "1h",
				}
			),
		};
	}
}
