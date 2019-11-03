import {MoveEntityActionDecl, SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {PresetCategory} from '../model/model';

export class SavePresetCategoryAction implements SaveEntityActionDecl<PresetCategory> {
	static readonly type = '[PresetCategory] Save';
	public constructor(public readonly entity: PresetCategory) { }
}

export class MovePresetCategoryAction implements MoveEntityActionDecl<PresetCategory> {
	static readonly type = '[PresetCategory] Move';
	public constructor(public readonly oldIndex: number, public readonly newIndex: number) { }
}
