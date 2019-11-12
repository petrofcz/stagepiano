import {MortalInterface} from '../../../model/mortalInterface';
import {Injectable} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {ManualState} from '../../../../../shared/manual/state/manual.state';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Layer} from '../../../../../shared/manual/model/layer';
import {BiduleState} from '../../../../../shared/bidule/bidule.state';
import {VST} from '../../../../../shared/vst/model/vst';
import {VSTState} from '../../../../../shared/vst/state/vst.state';
import {filter, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Effect, EffectScope} from '../../../../../shared/vst/model/effect';
import {DisplayRegionDriver} from '../../../hw/display/display-region-driver';
import {SessionState} from '../../../../../shared/session/state/session.state';
import {SetKeyboardRouteAction} from '../../../../../shared/session/state/session.actions';
import {KeyboardRouter} from '../../../router/keyboardRouter';

@Injectable({
	providedIn: 'root'
})
export class EffectOverviewController implements MortalInterface {

	private static readonly ROW_NAMES = 1
	private static readonly ROW_VALUES = 2;

	@Select(VSTState.getVstById)
	vstsGetter: Observable<(vst: string) => VST|null>;

	@Select(ManualState.getLayers)
	layers$: Observable<Layer[]>;

	@Select(BiduleState.getAvailableGlobalEffectIds)
	globalEffectIds$: Observable<string[]>;

	private buttonsByRow: { [key: number]: number[] } = {};

	private subscriptions: Subscription[] = [];

	constructor(private store: Store, private display: DisplayRegionDriver) {
		this.buttonsByRow = {
			1: this.display.buttonMatrix.getIdsForRow(1),
			2: this.display.buttonMatrix.getIdsForRow(2)
		};
	}

	onDestroy(): void {
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.display.clearDisplay();
		for (const subscription of this.subscriptions) {
			subscription.unsubscribe();
		}
		this.subscriptions = [];
	}

	onInit(): void {
		let availableEffects$: Observable<Effect[]>;

		// --- Effect list ---

		// prepare available effects
		availableEffects$ = this.store.select(SessionState.getEffectDisposition)
			.pipe(switchMap((disposition) => {
				let effects$: Observable<Effect[]>;
				if (disposition.scope === EffectScope.Global) {
					effects$ = combineLatest(
						this.globalEffectIds$,
						this.vstsGetter
					).pipe(map(([ids, getter]) => {
						const arr = [];
						for (const id of ids) {
							arr.push(getter(id));
						}
						return arr;
					}));
				} else {
					effects$ = <Observable<Effect[]>> combineLatest(
						this.store.select(ManualState.getCurrentLayer),
						this.store.select(VSTState.getEffects)
					).pipe(map(([layer, effects]): Effect[] => {
						return effects.filter((effect) => {
							return layer.availableVstIds.indexOf(effect.id) > -1;
						});
					}));
				}
				return effects$.pipe(map(effects => {
					return effects.filter(effect => {
						return effect.placement === disposition.placement;
					});
				}));
			}));

		// display
		this.subscriptions.push(
			availableEffects$.subscribe(availableEffects => {
				this.display.display.clearRow(EffectOverviewController.ROW_NAMES);
				this.buttonsByRow[EffectOverviewController.ROW_NAMES].forEach((buttonId) => {
					this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
				});
				for (let i = 0; i < availableEffects.length; i++) {
					this.display.display.setCellContent(
						EffectOverviewController.ROW_NAMES,
						i + 1,
						availableEffects[i].name
					);
					this.display.buttonMatrix.buttons.setButtonEnabled(this.buttonsByRow[EffectOverviewController.ROW_NAMES][i], true);
				}
			})
		);

		// handle click
		this.subscriptions.push(
			this.display.buttonMatrix.onButtonClick.pipe(filter(evt => {
				return evt.row === EffectOverviewController.ROW_NAMES;
			})).pipe(withLatestFrom(availableEffects$)).subscribe(([clickEvt, effects]) => {
				console.log('ROUTE TO ' + effects[clickEvt.col - 1]);
				this.store.dispatch(new SetKeyboardRouteAction(KeyboardRouter.ROUTE_EFFECT));
			})
		);

		// --- Parameter mapping & values ---
	}

}