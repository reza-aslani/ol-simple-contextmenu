import { Map, Overlay } from "ol";
import { Coordinate } from "ol/coordinate";
import { EventsKey } from "ol/events";
import { FeatureLike } from "ol/Feature";
import './ol-simple-contextmenu.css';
export declare type GET_ITEMS_HANDLER = (evt: EventsKey, coordinate: Coordinate, features: FeatureLike[]) => MenuItem[];
declare type CLICK_HANDLER_SYNC = (itemKey?: string, info?: any, e?: MouseEvent) => void;
declare type CLICK_HANDLER_ASYNC = (itemKey?: string, info?: any, e?: MouseEvent) => Promise<void>;
export declare type CLICK_HANDLER = CLICK_HANDLER_SYNC | CLICK_HANDLER_ASYNC;
declare type DEVIDER = 'top' | 'bottom' | 'top-bottom';
export interface MenuItem {
    itemKey?: string;
    icon: string | null;
    text: string;
    onClick?: ((itemKey?: string, info?: any, e?: MouseEvent) => void) | CLICK_HANDLER;
    divider?: DEVIDER;
}
export default class CreateContextMenuOverlay {
    private htmlMenu;
    private map;
    overlay: Overlay;
    createMenuItems: GET_ITEMS_HANDLER;
    rtl: boolean;
    constructor(map: Map, createMenuItems: GET_ITEMS_HANDLER, theme: 'dark' | 'light', rtl?: boolean);
    private closeIt;
    private openIt;
    disposeIt(): void;
}
export {};
