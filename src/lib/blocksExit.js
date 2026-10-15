/**
 * Shared scroll-driven value for the Pitch scene's exit (0 → 1).
 *
 * The journey timeline tweens it; `BuildingBlocks3D` reads it every frame:
 *   0 → 0.35   the green baseplate rectangle slides up into a solid block
 *   0.3 → 1    the camera pushes into the block's top face until green fills the screen
 *   0.9 → 1    the block dissolves as the next scene arrives
 */
export const blocksExit = { progress: 0 };
