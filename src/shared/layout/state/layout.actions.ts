import {Layout} from '../model/layout';
import {SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';

// todo maybe remove selected layout?

export interface SelectLayoutActionDecl {
	readonly layoutId?: string;
}
export interface SetLayoutLoadingActionDecl {
	readonly loading: boolean;
}

export class SelectLayoutAction implements SelectLayoutActionDecl {
	static readonly type = '[Layout] Select';
	public constructor(public readonly layoutId?: string) { }
}

export class SaveLayoutAction implements SaveEntityActionDecl<Layout> {
	static readonly type = '[Layout] Save';
	public constructor(public readonly entity: Layout) { }
}

export class UpdateLayoutAction implements UpdateEntityActionDecl<Layout> {
	static readonly type = '[Layout] Update';
	public constructor(public readonly entity: Partial<Layout>) { }
}

export class SetLayoutLoadingAction implements SetLayoutLoadingActionDecl {
	static readonly type = '[Layout] Set loading';
	public constructor(public readonly loading: boolean) { }
}

export class ResetLayoutAction {
	static readonly type = '[Layout] Reset';
}