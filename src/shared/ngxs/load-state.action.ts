export interface LoadStateActionDecl {
	items: object;
}

export class LoadStateAction implements LoadStateActionDecl {
	static readonly type = '[State] Load';
	constructor(public items: object) { }
}