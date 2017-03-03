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

        if (this.resolved_url) {
            return this.resolved_url;
        }

        return "";
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
