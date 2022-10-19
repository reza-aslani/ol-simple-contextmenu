import { Feature, Map, MapBrowserEvent, Overlay } from "ol";
import { Coordinate } from "ol/coordinate";
import { EventsKey } from "ol/events";
import { FeatureLike } from "ol/Feature";
import { Geometry } from "ol/geom";
import { toLonLat } from "ol/proj";
import './ol-simple-contextmenu.css'
 
export type GET_ITEMS_HANDLER = (evt: EventsKey, coordinate: Coordinate, features: FeatureLike[]) => MenuItem[]

type CLICK_HANDLER_SYNC = (itemKey?: string, info?: any, e?: MouseEvent) => void
type CLICK_HANDLER_ASYNC = (itemKey?: string, info?: any, e?: MouseEvent) => Promise<void>
export type CLICK_HANDLER = CLICK_HANDLER_SYNC | CLICK_HANDLER_ASYNC

type DEVIDER = 'top' | 'bottom' | 'top-bottom'

export interface MenuItem {
    itemKey?: string,
    icon: string | null
    text: string
    onClick?: ((itemKey?: string, info?: any, e?: MouseEvent) => void) | CLICK_HANDLER
    divider?: DEVIDER //string //= top, bottom, top-bottom
}
class HtmlContextMenu {

    rootElement: HTMLElement | null
    mode: string
    isOpened: boolean

    constructor(theme: string, rtl: boolean) {
        this.rootElement = this.createMenuRootElement(rtl)
        this.mode = theme
        this.isOpened = false;
        //document.addEventListener('click', () => this.isOpened && this.close())
        //window.addEventListener('blur', () => this.isOpened && this.close())
    }

    createMenuRootElement(rtl: boolean) {
        const root = document.createElement('div')
        root.id = 'contextmenu-root-div'
        root.style.direction = rtl ? 'rtl' : 'ltr'
        document.body.appendChild(root)
        return root
    }

    createItemMarkup(menuItem: MenuItem, coordinate: Coordinate, features: FeatureLike[]) {
        const button = document.createElement("BUTTON");
        const item = document.createElement("LI");

        button.innerHTML = menuItem.text;
        button.classList.add("contextMenu-button");
        item.classList.add("contextMenu-item");

        if (menuItem.divider) item.setAttribute("data-divider", menuItem.divider);
        item.appendChild(button);

        button.onclick = (e) => {
            const id = features.length ? features[0].get('obj-id') : null
            const featId = features.length ? features[0].getId() : null
            if (menuItem.onClick) menuItem.onClick(menuItem.itemKey, { id, featId, coordinate /*, features*/ }, e)
            this.close()
        }

        return item
    }

    createItemsMarkup(items: MenuItem[], coordinate: Coordinate, features: FeatureLike[]) {
        const itemsElements: HTMLElement[] = [];

        items.forEach((data, index) => {
            const item: HTMLElement = this.createItemMarkup(data, coordinate, features);
            item.children[0].setAttribute(
                "style",
                `animation-delay: ${index * 0.08}s`
            );
            itemsElements.push(item);
        });

        return itemsElements;
    }

    createMarkups(items: MenuItem[], coordinate: Coordinate, features: FeatureLike[]) {
        const el = document.createElement("ul");

        el.classList.add("contextMenu");
        el.setAttribute("data-theme", this.mode);

        const itemsElements = this.createItemsMarkup(items, coordinate, features)
        itemsElements.forEach((item) => el.appendChild(item));

        //document.body.appendChild(el)
        this.rootElement?.appendChild(el)
        return el
    }

    open(getItemsFunction: GET_ITEMS_HANDLER, coordinate: Coordinate, features: FeatureLike[], evt: EventsKey) {
        this.rootElement!.innerHTML = ''
        const items = getItemsFunction(evt, coordinate, features)
        this.createMarkups(items, coordinate, features)
        this.isOpened = true
    }

    close() {
        if (this.isOpened) {
            this.isOpened = false
            this.rootElement!.innerHTML = ''
        }
    }
}

//export class SimpleOlContextMenu extends Overlay { }

export default class CreateContextMenuOverlay {

    private htmlMenu: HtmlContextMenu
    private map: Map
    overlay: Overlay
    createMenuItems: GET_ITEMS_HANDLER
    rtl: boolean

    constructor(map: Map, createMenuItems: GET_ITEMS_HANDLER, theme: 'dark' | 'light', rtl: boolean = false) {
        if (!map)
            throw new Error('This menu needs an openlayers map !')

        this.map = map
        this.createMenuItems = createMenuItems
        this.rtl = rtl
        this.htmlMenu = new HtmlContextMenu(theme, rtl)

        //--- Create an overlay to anchor the popup to the map.
        this.overlay = new Overlay({
            element: this.htmlMenu.rootElement!,
            autoPan: {
                animation: {
                    duration: 1,
                },
            },
        });

        map.on('click', this.closeIt);

        //@ts-ignore
        map.on('contextmenu', this.openIt);
    }

    private closeIt = (e: KeyboardEvent | MapBrowserEvent<any>) => this.htmlMenu.close()
    private openIt = (evt: EventsKey) => {
        //@ts-ignore
        evt.preventDefault()
        //@ts-ignore
        evt.stopPropagation()

        //@ts-ignore
        const coordinate = evt.coordinate;
        this.overlay.setPosition(coordinate);
        //const ll = toLonLat(coordinate);

        //@ts-ignore
        const features = this.map.getFeaturesAtPixel(evt.pixel);

        this.htmlMenu.open(this.createMenuItems, coordinate, features, evt)
    }

    disposeIt() {
        this.map.un('click', this.closeIt);

        //@ts-ignore
        this.map.un('contextmenu', this.openIt);
    }
}

//module.exports = ctxMenu