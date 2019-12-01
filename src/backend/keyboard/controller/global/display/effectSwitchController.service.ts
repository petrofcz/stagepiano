import {MortalInterface} from '../../../model/mortalInterface';
import {EventEmitter, Injectable} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {ManualState} from '../../../../../shared/manual/state/manual.state';
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from 'rxjs';
import {Layer} from '../../../../../shared/manual/model/layer';
import {BiduleState} from '../../../../../shared/bidule/state/bidule.state';
import {VST} from '../../../../../shared/vst/model/vst';
import {VSTState} from '../../../../../shared/vst/state/vst.state';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Effect, EffectScope} from '../../../../../shared/vst/model/effect';
import {DisplayRegionDriver} from '../../../hw/display/display-region-driver';
import {SessionState} from '../../../../../shared/session/state/session.state';
import {SetKeyboardRouteAction} from '../../../../../shared/session/state/session.actions';
import {KeyboardRouter} from '../../../router/keyboardRouter';
import {LoadParamMappingPageFromEffectAction} from '../../../../../shared/paramMapping/state/paramMappingPage.actions';
import {ButtonMatrixEvent} from '../../../hw/common/button/buttonMatrix';

@Injectable({
	providedIn: 'root'
})
export class EffectSwitchController implements MortalInterface {
	
	private static readonly ROW_NAMES = 1;
	private static readonly ROW_VALUES = 2;

	private _row = 2; // 1-indexed

	@Select(VSTState.getVstById)
	vstsGetter: Observable<(vst: string) => VST|null>;

	@Select(ManualState.getLayers)
	layers$: Observable<Layer[]>;

	@Select(BiduleState.getAvailableGlobalEffectIds)
	globalEffectIds$: Observable<string[]>;

	private _onSwitch = new EventEmitter<Effect>();

	private buttonsByRow: { [key: number]: number[] } = {};

	private subscriptions: Subscription[] = [];

	private _availableEffects$: Observable<Effect[]>;

	private _activeEffectId$ = new BehaviorSubject<string|null>(null);

	constructor(private store: Store, private display: DisplayRegionDriver) {
		this.buttonsByRow = {
			1: this.display.buttonMatrix.getIdsForRow(1),
			2: this.display.buttonMatrix.getIdsForRow(2)
		};
	}

	onDestroy(): void {
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.buttonMatrix.buttons.disableAllButtons();
		console.log('[ESC] Destroy');
		this.display.display.clearRow(this._row);
		this.setActiveEffectId(null);
		for (const subscription of this.subscriptions) {
			subscription.unsubscribe();
		}
		this.subscriptions = [];
	}

	onInit(): void {
		let availableEffects$: Observable<Effect[]>;

		console.log('[ESC] Init');
		// --- Effect list ---

		// prepare available effects
		availableEffects$ = this.store.select(SessionState.getEffectDisposition)
			.pipe(switchMap((disposition) => {
				if (!disposition) {
					return [];
				}
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
		this._availableEffects$ = availableEffects$;

		// display
		this.subscriptions.push(
			availableEffects$.subscribe(availableEffects => {
				console.log('[ESC] AvailableEffects');
				this.display.display.clearRow(this._row);
				this.buttonsByRow[this._row].forEach((buttonId) => {
					// console.log('EO BTN OFF ' + buttonId);
					this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
				});
				for (let i = 0; i < availableEffects.length; i++) {
					this.display.display.setCellContent(
						this._row,
						i + 1,
						availableEffects[i].name
					);
					// console.log('EO BTN ON ' + i);
					this.display.buttonMatrix.buttons.setButtonEnabled(this.buttonsByRow[this._row][i], true);
				}
			})
		);

		this.subscriptions.push(
			combineLatest(
				availableEffects$,
				this._activeEffectId$
			)
				.pipe(debounceTime(50))
				.pipe(distinctUntilChanged())
				.subscribe(([availableEffects, activeEffectId]) => {
					let effectIndex = null;
					availableEffects.forEach((v, i) => {
						if (v.id === activeEffectId) {
							effectIndex = i;
						}
					});
					this.display.buttonMatrix.getIdsForRow(this._row).forEach(
						buttonId => this.display.buttonMatrix.buttons.setLed(buttonId, false)
					);
					if (effectIndex !== null) {
						this.display.buttonMatrix.buttons.setLed(
							this.display.buttonMatrix.getIdsForRow(this._row)[effectIndex], true
						);
					}
				})
		);

		// handle click
		this.subscriptions.push(
			this.store.select(SessionState.isEditing)
				.pipe(switchMap(isEditing => isEditing ? <Observable<ButtonMatrixEvent>>of() :
					this.display.buttonMatrix.onButtonClick.pipe(filter(evt => {
						return evt.row === this._row;
					}))
				))
				.pipe(withLatestFrom(availableEffects$))
				.subscribe(([clickEvt, effects]) => {
					if (clickEvt) {
						this.onSwitch.emit(effects[clickEvt.col - 1]);
					}
				})
		);
		
	}

	get row(): number {
		return this._row;
	}

	set row(value: number) {
		this._row = value;
	}

	get onSwitch(): EventEmitter<Effect> {
		return this._onSwitch;
	}

	get availableEffects$(): Observable<Effect[]> {
		return this._availableEffects$;
	}

	public setActiveEffectId(effectId: string|null) {
		this._activeEffectId$.next(effectId);
	}
}