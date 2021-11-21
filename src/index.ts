import "reflect-metadata";
import express from "express";
import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./userResolver";

(async () => {
	dotenv.config({ path: path.resolve(__dirname, "../.env") });
	const app = express();
	app.get("/", (_req, res) => res.send("hello"));

	const apolloServer = new ApolloServer({
		schema: await buildSchema({ resolvers: [UserResolver] }),
		context: ({ req, res }) => ({ req, res }),
	});
	await apolloServer.start();
	apolloServer.applyMiddleware({ app });

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
