import {EffectPlacement, EffectScope} from '../../vst/model/effect';

export interface EffectDispositionInterface {
	readonly placement: EffectPlacement;
	readonly scope: EffectScope;
}

export class EffectDisposition implements EffectDispositionInterface{

	constructor(
		public readonly placement: EffectPlacement,
		public readonly scope: EffectScope
	) { }

}