import { getModelForClass, prop } from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class UserClass {
	@Field(() => ID)
	@prop()
	userId: mongoose.Schema.Types.ObjectId;

	@Field()
	@prop({ required: true })
	public name!: string;

	@Field()
	@prop({ required: true })
	public email!: string;

	@Field()
	@prop({ required: true })
	public password!: string;

	@prop({ default: 0 })
	tokenVersion: number;
}

export const UserModel = getModelForClass(UserClass);
