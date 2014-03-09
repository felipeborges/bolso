/*
 * Copyright (c) 2014 Felipe Borges <felipe10borges@gmail.com>.
 *
 * Gnome Pocket is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome Pocket is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Documents; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 */

const GObject = imports.gi.GObject;
const Lang = imports.lang;

const Collections = {
    RECENT: 0,
    FAVORITES: 1,
    ARCHIVE: 2
};

const Item = new Lang.Class({
    Name: 'Item',
    Extends: GObject.Object,

    _init: function(item) {
        this.parent();

        this.id = null;
        this.resolved_url = "";
        this.given_title = "";
        this.resolved_title = null;
        this.favorite = null;
        this.status = null;
        this.exercpt = null;

        this.is_article = false;
        this.has_image = false;
        this.has_video = false;

        this.word_count = null;
        this.tags = null;
        this.authors = null;
        this.images = null;
        this.videos = null;

        this.populateFromJsonObject(item);
    },

    populateFromJsonObject: function(object) {
        for (let prop in object) {
            this[prop] = object[prop];
        }
    },

    populateFromCursor: function(cursor) {
        /*
         * TODO: create an Item object from Tracker cursor.
         */
    },

    open: function() {
        log("open");
    }
});

const Articles = new Lang.Class({
    Name: 'Articles',
    Extends: GObject.Object,
    Signals: {
        'item-added': {
            param_types: [GObject.TYPE_INT, GObject.TYPE_OBJECT]
        }
    },

    _init: function(title) {
        this.parent();

        this._items = {};
        this._items[Collections.RECENT] = {};
        this._items[Collections.FAVORITES] = {};
        this._items[Collections.ARCHIVE] = {};

        this._activeItem = null;
        this._title = null;

        if (title)
            this._title = title;
    },

    getTitle: function() {
        return this._title;
    },

    addItem: function(collection, item) {
        this._items[collection][item.item_id] = item;

        this.emit('item-added', collection, item);
    }
});
