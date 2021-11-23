import { sign } from "jsonwebtoken";
import { UserClass } from "../models/userModel";

export const createAccessToken = (user: UserClass) => {
	return sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: "15m",
	});
};

export const createRefreshToken = (user: UserClass) => {
	return sign(
		{ userId: user.userId, tokenVersion: user.tokenVersion },
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: "7d",
		}
	);
};
