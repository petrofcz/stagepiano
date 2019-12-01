import {AddEntityActionDecl, MoveEntityActionDecl, SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {Preset, PresetCategory} from '../model/model';

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

export interface MovePresetActionDecl extends MoveEntityActionDecl<Preset> {
	categoryId: string;
}

export class MovePresetAction implements MovePresetActionDecl {
	static readonly type = '[PresetCategory] Move preset';
	public constructor(public readonly oldIndex: number, public readonly newIndex: number, public readonly categoryId: string) { }
}

export interface AddPresetToCategoryActionDecl {
	presetId: string;
	categoryId: string;
}

export class AddPresetToCategoryAction implements  AddPresetToCategoryActionDecl {
	static readonly type = '[PresetCategory] Add preset to category';
	constructor(public readonly presetId: string, public readonly categoryId: string) { }
}