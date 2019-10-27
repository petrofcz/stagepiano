import {Pipe, PipeTransform} from '@angular/core';
import {EffectPlacement} from '../../../shared/vst/model/effect';

@Pipe({ name: 'effectPlacement'} )
export class EffectPlacementPipe implements PipeTransform {
	transform(effectPlacement: number): any {
		switch (effectPlacement) {
			case EffectPlacement.Post:
				return '<span class="tag tag-green">POST</span>';
			case EffectPlacement.Pre:
				return '<span class="tag tag-red">PRE</span>';
			default:
				return effectPlacement;
		}
	}
}