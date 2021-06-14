
## About `card-center-feature`
A card center can be treated as if it was a pointer when a card is moving. It looks smoother if a card center triggers `updateContainer` and `updateGhost`.

But it takes major design changes - onHover/onLeave implementations use mouseenter/mouseleave events,
they should be replaced with custom events...

smth like

```
event: "drag-move"
handlers:
    - Container.handleHelperMove to update container
    (maybe there is no need in this handler, the next is quite enough)

    - Draggable.onHover with manual checks isPointInside()
```



## TODOs

- [x] change previewNode implementation using original node with visibility=hidden
- [x] add onDrop transitions


### extra features and fixes

- [ ] add on-sort transitions (but maybe its not worth such efforts)
- [ ] try to simulate behaviour as if the pointer was in the helper's center (it looks better)


### important

- [ ] scroll X only if pointer within Y-bounds of a container and vice versa
- [ ] don't scroll containers and window simultaneously (window is first)
- [ ] add the step `resizeHelper` after `moveHelperToGhost`


### testing

- [ ] test horizontal lists
- [ ] test firing custom events
- [ ] test for memory leaks


### Bugs

- [x] losing initial scroll when switching container (it works, actual problem is the next bug)
- [x] losing initial window scroll

