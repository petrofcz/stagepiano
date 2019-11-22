export interface SetAvailableGlobalEffectsActionDecl {
	readonly effectIds: string[];
}

export class SetAvailableGlobalEffectsAction implements SetAvailableGlobalEffectsActionDecl {
	static readonly type = '[Bidule] Set available global effects';
	public constructor(public readonly effectIds: string[]) { }
}

export interface SendOscMessageActionDecl {
	address: string;
	args: any[];
}
export class SendOscMessageAction implements SendOscMessageActionDecl {
	static readonly type = '[Bidule] Send OSC';
	constructor (public address: string, public args: any[]) { }
}
