import {EventEmitter, Injectable} from '@angular/core';
import {interval, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class InterruptionClock {

	protected static readonly SLOW_FREQ = 2;
	protected static readonly SLOWMED_FREQ = 3;
	protected static readonly FASTMED_FREQ = 4;
	protected static readonly FAST_FREQ = 6;

	private _slow: Observable<boolean>;
	private _slowMed: Observable<boolean>;
	private _fastMed: Observable<boolean>;
	private _fast: Observable<boolean>;

	constructor() {
		this._slow = interval(1000 / InterruptionClock.SLOW_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		}));
		this._slowMed = interval(1000 / InterruptionClock.SLOWMED_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		}));
		this._fastMed = interval(1000 / InterruptionClock.FASTMED_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		}));
		this._fast = interval(1000 / InterruptionClock.FAST_FREQ).pipe(map((seq: number) => {
			return seq % 2 === 0;
		}));
	}

	// 0-based, max 3!
	public getByIndex(index: number): Observable<boolean> {
		switch (index) {
			case 0:
				return this._slow;
			case 1:
				return this._slowMed;
			case 2:
				return this._fastMed;
			case 3:
				return this._fast;
			default:
				return this._slow;
		}
	}

	get slow(): Observable<boolean> {
		return this._slow;
	}

	get slowMed(): Observable<boolean> {
		return this._slowMed;
	}

	get fastMed(): Observable<boolean> {
		return this._fastMed;
	}

	get fast(): Observable<boolean> {
		return this._fast;
	}
}