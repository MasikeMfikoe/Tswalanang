;/>

• At the very bottom of the file add:

```ts
// ---------------------------------------------------------------------------
//  Compatibility re-exports - other code still expects these names
// ---------------------------------------------------------------------------
export { TrackshipService as TrackShipService } // named export
export default TrackshipService // default export
