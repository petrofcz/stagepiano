import {AddEntityActionDecl, MoveEntityActionDecl, SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {PresetCategory} from '../model/model';

export class UpdatePresetCategoryAction implements UpdateEntityActionDecl<PresetCategory> {
	static readonly type = '[PresetCategory] Update';
	public constructor(public readonly entity: Partial<PresetCategory>) { }
}

export class AddPresetCategoryAction implements AddEntityActionDecl<PresetCategory> {
	static readonly type = '[PresetCategory] Add';
	public constructor(public readonly entity: PresetCategory) { }
}

export class MovePresetCategoryAction implements MoveEntityActionDecl<PresetCategory> {
	static readonly type = '[PresetCategory] Move';
	public constructor(public readonly oldIndex: number, public readonly newIndex: number) { }
}
