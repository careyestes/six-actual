/**
 * Serializes decorative video downloads by DOM priority.
 * Lower numbers load first; the next priority only starts after
 * the current one reaches a playable state (or is skipped).
 */

let activePriority = 0;
/** @type {Map<number, Array<() => void>>} */
const waiters = new Map();

/**
 * @param {number} priority
 * @returns {Promise<void>}
 */
export function waitForVideoTurn(priority) {
	if (priority <= activePriority) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		const list = waiters.get(priority) ?? [];
		list.push(resolve);
		waiters.set(priority, list);
	});
}

/**
 * Allow the next priority level to begin loading.
 * @param {number} priority
 */
export function releaseVideoTurn(priority) {
	const next = priority + 1;
	if (next <= activePriority) return;

	activePriority = next;

	for (const [p, resolvers] of [...waiters.entries()]) {
		if (p <= activePriority) {
			waiters.delete(p);
			for (const resolve of resolvers) resolve();
		}
	}
}
