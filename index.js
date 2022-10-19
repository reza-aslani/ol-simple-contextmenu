"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ol_1 = require("ol");
require("./ol-simple-contextmenu.css");
class HtmlContextMenu {
    constructor(theme, rtl) {
        this.rootElement = this.createMenuRootElement(rtl);
        this.mode = theme;
        this.isOpened = false;
        //document.addEventListener('click', () => this.isOpened && this.close())
        //window.addEventListener('blur', () => this.isOpened && this.close())
    }
    createMenuRootElement(rtl) {
        const root = document.createElement('div');
        root.id = 'contextmenu-root-div';
        root.style.direction = rtl ? 'rtl' : 'ltr';
        document.body.appendChild(root);
        return root;
    }
    createItemMarkup(menuItem, coordinate, features) {
        const button = document.createElement("BUTTON");
        const item = document.createElement("LI");
        button.innerHTML = menuItem.text;
        button.classList.add("contextMenu-button");
        item.classList.add("contextMenu-item");
        if (menuItem.divider)
            item.setAttribute("data-divider", menuItem.divider);
        item.appendChild(button);
        button.onclick = (e) => {
            const id = features.length ? features[0].get('obj-id') : null;
            const featId = features.length ? features[0].getId() : null;
            if (menuItem.onClick)
                menuItem.onClick(menuItem.itemKey, { id, featId, coordinate /*, features*/ }, e);
            this.close();
        };
        return item;
    }
    createItemsMarkup(items, coordinate, features) {
        const itemsElements = [];
        items.forEach((data, index) => {
            const item = this.createItemMarkup(data, coordinate, features);
            item.children[0].setAttribute("style", `animation-delay: ${index * 0.08}s`);
            itemsElements.push(item);
        });
        return itemsElements;
    }
    createMarkups(items, coordinate, features) {
        var _a;
        const el = document.createElement("ul");
        el.classList.add("contextMenu");
        el.setAttribute("data-theme", this.mode);
        const itemsElements = this.createItemsMarkup(items, coordinate, features);
        itemsElements.forEach((item) => el.appendChild(item));
        //document.body.appendChild(el)
        (_a = this.rootElement) === null || _a === void 0 ? void 0 : _a.appendChild(el);
        return el;
    }
    open(getItemsFunction, coordinate, features, evt) {
        this.rootElement.innerHTML = '';
        const items = getItemsFunction(evt, coordinate, features);
        this.createMarkups(items, coordinate, features);
        this.isOpened = true;
    }
    close() {
        if (this.isOpened) {
            this.isOpened = false;
            this.rootElement.innerHTML = '';
        }
    }
}
//export class SimpleOlContextMenu extends Overlay { }
class CreateContextMenuOverlay {
    constructor(map, createMenuItems, theme, rtl = false) {
        this.closeIt = (e) => this.htmlMenu.close();
        this.openIt = (evt) => {
            //@ts-ignore
            evt.preventDefault();
            //@ts-ignore
            evt.stopPropagation();
            //@ts-ignore
            const coordinate = evt.coordinate;
            this.overlay.setPosition(coordinate);
            //const ll = toLonLat(coordinate);
            //@ts-ignore
            const features = this.map.getFeaturesAtPixel(evt.pixel);
            this.htmlMenu.open(this.createMenuItems, coordinate, features, evt);
        };
        if (!map)
            throw new Error('This menu needs an openlayers map !');
        this.map = map;
        this.createMenuItems = createMenuItems;
        this.rtl = rtl;
        this.htmlMenu = new HtmlContextMenu(theme, rtl);
        //--- Create an overlay to anchor the popup to the map.
        this.overlay = new ol_1.Overlay({
            element: this.htmlMenu.rootElement,
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
    disposeIt() {
        this.map.un('click', this.closeIt);
        //@ts-ignore
        this.map.un('contextmenu', this.openIt);
    }
}
exports.default = CreateContextMenuOverlay;
//module.exports = ctxMenu
