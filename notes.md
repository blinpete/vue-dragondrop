
## Про State

- Возможно стоит сделать ContainerMixin.data() словарем а не функцией, чтобы он был общий у всех контейнеров. его можно исползовать как общий state-manager. но тогда нужно как-то еще добавлять индивидуальные поля, например поле group должно быть свое для каждого контейнера

- или можно просто завести в _utils.js отдельный объект Manager и его передать в ContainerMixin и ElementMixin. звучит просто и вроде как будет отлично



## TODOs

- [x] change previewNode implementation using original node with visibility=hidden
- [x] add onDrop transitions


### extra features and fixes

- [ ] add on-sort transitions (its not as easy, maybe its not worth such efforts)
- [ ] try to simulate behaviour as if the pointer was in the helper's center (it looks better)


### important

- [ ] check global variables (vendorPrefix, manager, ...) minimize them to make this project easy-importable


### testing

- [ ] test horizontal lists
- [ ] test firing custom events
- [ ] test for memory leaks


