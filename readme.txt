
Usage:

const createMenuItems = (evt: EventsKey, coordinate: Coordinate, features: FeatureLike[]): MenuItem[] => {

    const [lng, lat] = transform(coordinate, 'EPSG:3857', 'EPSG:4326')
    console.log('lat, lng=', lat, lng);

    const runtime_items: MenuItem[] = []

    runtime_items.push({
        itemKey: 'add',
        text: 'Add Marker',
        icon: null,
        onClick: () => {
          // code to add marker
        }
    })

    if(features.length>0)
        runtime_items.push({
            itemKey: 'edit',
            text: 'Edit Feature : ' + features[0].getId(),
            icon: null,
            onClick: () => {
            // code to edit features[0]
            }
        })

    return runtime_items
}

.
.
.

const menu = new CreateContextMenuOverlay(map, createMenuItems, 'dark', false) // map : is a openlayers map
map.addOverlay(menu.overlay)


