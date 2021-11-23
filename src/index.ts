import "reflect-metadata";
import express from "express";
import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./userResolver";
import { sign, verify } from "jsonwebtoken";
import { UserModel } from "./models/userModel";

(async () => {
	dotenv.config({ path: path.resolve(__dirname, "../.env") });
	const app = express();
	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	);
	app.use(cookieParser());

	// app.get("/", (_req, res) => res.send("hello"));

	app.post("/api/refresh-token", async (req, res) => {
		const token = req.cookies.vId;
		if (!token) {
			return res.send({ ok: false, accessToken: "" });
		}
		let payload: any = null;
		try {
			payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
		} catch (error) {
			return res.send({ ok: false, accessToken: "" });
		}

		//token valid, send an accessToken
		const user = await UserModel.findOne({ id: payload.userId });
		if (!user) {
			return res.send({ ok: false, accessToken: "" });
		}

		// if (user.tokenVersion !== payload.tokenVersion) {
		// 	return res.send({ ok: false, accessToken: "" });
		// }
		// renew the refresh token for further use
		res.cookie(
			"vId",
			sign(
				{ userId: user._id.toString(), tokenVersion: user.tokenVersion },
				process.env.REFRESH_TOKEN_SECRET!,
				{
					expiresIn: "7d",
				}
			),
			{
				httpOnly: true,
			}
		);
		// new accessToken
		return res.send({
			ok: true,
			accessToken: sign(
				{ userId: user._id.toString() },
				process.env.TOKEN_SECRET!,
				{ expiresIn: "1h" }
			),
		});
	});

	const apolloServer = new ApolloServer({
		schema: await buildSchema({ resolvers: [UserResolver] }),
		context: ({ req, res }) => ({ req, res }),
	});
	await apolloServer.start();
	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	mongoose
		.connect(process.env.MONGO_URI!, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		} as ConnectOptions)
		.then((_m) => console.log("DB connected"))
		.catch((err) => console.log(err));
	app.listen(4000, () => {
		console.log("server started on port 4000");
	});
})();
