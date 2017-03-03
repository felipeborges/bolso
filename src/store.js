/* store.js
 *
 * Copyright (C) 2017 Felipe Borges <felipeborges@gnome.org>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const Articles = imports.articles;

const QUERY_SIZE = 20;

let store_instance = null;

function getDefault() {
    if (store_instance == null)
        store_instance = new Store();

    return store_instance;
}

const Store = new Lang.Class({
    Name: 'Store',
    Extends: GObject.Object,
    Properties: {
      'mylist': GObject.ParamSpec.object('mylist', 'My List',
            'Articles which were recently added.',
            GObject.ParamFlags.READABLE,
            Gio.ListStore),
      'archive': GObject.ParamSpec.object('archive', 'Archive',
            'Articles which were archived.',
            GObject.ParamFlags.READABLE,
            Gio.ListStore),
      'favorites': GObject.ParamSpec.object('favorites', 'Favorites',
            'Articles which were marked as favorites.',
            GObject.ParamFlags.READABLE,
            Gio.ListStore),
    },

    get mylist() {
        return this._mylist;
    },

    get archive() {
        return this._archive;
    },

    get favorites() {
        return this._favorites;
    },

    _init: function() {
        this._mylist = new Gio.ListStore(GObject.TYPE_OBJECT);
        this._archive = new Gio.ListStore(GObject.TYPE_OBJECT);
        this._favorites = new Gio.ListStore(GObject.TYPE_OBJECT);
    },

    retrieveArticles(pocketApi) {
        pocketApi.retrieveAsync("state", "unread", QUERY_SIZE, 0,
          (function(list) {
             for (let idx in list)
               this._mylist.append(new Articles.Item(list[idx]));
           }).bind(this));

        pocketApi.retrieveAsync("favorite", "1", QUERY_SIZE, 0,
          (function(list) {
             for (let idx in list)
               this._archive.append(new Articles.Item(list[idx]));
           }).bind(this));

        pocketApi.retrieveAsync("state", "archive", QUERY_SIZE, 0,
          (function(list) {
             for (let idx in list)
               this._favorites.append(new Articles.Item(list[idx]));
           }).bind(this));
    },
});
