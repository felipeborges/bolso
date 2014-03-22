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

        this.item_id = null;
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

        /* Index used for local reference. Not to be confused with item_id which
         * is how Pocket references an Item */
        this.index = null;

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

    getTitle: function() {
        if (this.resolved_title) {
            return this.resolved_title;
        }

        return this.given_title;
    },

    getDescription: function() {
        if (this.excerpt) {
            return this.excerpt;
        }

        return this.resolved_url;
    },

    isArchived: function() {
        return ((this.status === "1") ? true : false);
    },

    isFavorite: function() {
        return ((this.favorite === "1") ? true : false);
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
        },
        'item-removed': {
            param_types: [GObject.TYPE_INT, GObject.TYPE_OBJECT]
        },
        'item-archived': {
            param_types: [GObject.TYPE_INT, GObject.TYPE_OBJECT]
        },
        'item-favorited': {
            param_types: [GObject.TYPE_INT, GObject.TYPE_OBJECT]
        },
        'active-changed': {
            param_types: [GObject.TYPE_INT, GObject.TYPE_OBJECT]
        },
    },

    _init: function(title) {
        this.parent();

        this._items = [];
        this._items[Collections.RECENT] = [];
        this._items[Collections.FAVORITES] = [];
        this._items[Collections.ARCHIVE] = [];

        this._activeCollection = null;
        this._activeItem = null;
        this._title = null;

        if (title)
            this._title = title;
    },

    getTitle: function() {
        return this._title;
    },

    addItem: function(collection, item) {
        item.index = this._items[collection].length;
        this._items[collection].push(item);

        this.emit('item-added', collection, item);
    },

    getItemById: function(collection, id) {
        return this._items[collection][id];
    },

    setActiveItem: function(collection, item) {
        if (item != this._activeItem) {
            this._activeCollection = collection;
            this._activeItem = item;
            this.emit('active-changed', this._activeCollection, this._activeItem);

            return true;
        }

        return false;
    },

    setActiveItemById: function(collection, id) {
        let item = this.getItemById(collection, id);
        return this.setActiveItem(collection, item);
    },

    getActiveCollection: function() {
        return this._activeCollection;
    },

    getActiveItem: function() {
        return this._activeItem;
    },

    removeItemById: function(collection, id) {
        let item = this._items[collection][id];

        if (item) {
            delete this._items[collection][id];
            this.emit('item-removed', collection, item);
        }
    },

    removeItem: function(collection, item) {
        this.removeItemById(collection, item.index);
    },

    archiveItemById: function(collection, id) {
        let item = this._items[collection][id];

        if (item) {
            if (collection == Collections.RECENT) {
                delete this._items[collection][id];
            }
            this.emit('item-archived', collection, item);
            this.addItem(Collections.ARCHIVE, item);
        }
    },

    archiveItem: function(from, item) {
        this.archiveItemById(from, item.index);
    },

    unarchiveItem: function(collection, item) {
        // To do
        return;
    },

    favoriteItemById: function(collection, id) {
        let item = this._items[collection][id];

        if (item) {
            this.emit('item-favorited', collection, item);
            this.addItem(Collections.FAVORITES, item);
        }
    },

    favoriteItem: function(collection, item) {
        this.favoriteItemById(collection, item.index);
    },

    unfavoriteItem: function(collection, item) {
        // To do
        return;
    },
});
