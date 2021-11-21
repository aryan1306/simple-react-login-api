import { ApolloError } from "apollo-server-errors";
import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./../context/MyContext";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
	const authorization = context.req.headers["authorization"];

	if (!authorization) {
		throw new ApolloError("not authenticated");
	}

	try {
		const token = authorization.split(" ")[1];
		const payload = verify(token, process.env.TOKEN_SECRET!);
		context.payload = payload as any;
	} catch (error) {
		// console.log(error);
		throw new ApolloError("not authenticated");
	}

	return next();
};
