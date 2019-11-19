import {EffectPlacement, EffectScope} from '../../vst/model/effect';

export interface EffectDisposition {
	readonly placement: EffectPlacement;
	readonly scope: EffectScope;
}
