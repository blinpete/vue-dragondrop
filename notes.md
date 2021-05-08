
## Про State

- Возможно стоит сделать ContainerMixin.data() словарем а не функцией, чтобы он был общий у всех контейнеров. его можно исползовать как общий state-manager. но тогда нужно как-то еще добавлять индивидуальные поля, например поле group должно быть свое для каждого контейнера

- или можно просто завести в _utils.js отдельный объект Manager и его передать в ContainerMixin и ElementMixin. звучит просто и вроде как будет отлично



## TODOs

- [x] change previewNode implementation using original node with visibility=hidden
- [ ] test horizontal lists

important

- [ ] test firing custom events
- [ ] check global variables (vendorPrefix, manager, ...)
- [x] add onDrop transitions
- [ ] add on-sort transitions
