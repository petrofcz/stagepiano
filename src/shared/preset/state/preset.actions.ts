import {AddEntityActionDecl, MoveEntityActionDecl, SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {Preset} from '../model/model';

export class UpdatePresetAction implements UpdateEntityActionDecl<Preset> {
	static readonly type = '[Preset] Update';
	public constructor(public readonly entity: Partial<Preset>) { }
}

export class AddPresetAction implements AddEntityActionDecl<Preset> {
	static readonly type = '[Preset] Add';
	public constructor(public readonly entity: Preset) { }
}
