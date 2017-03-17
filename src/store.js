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
const Gom = imports.gi.Gom;
const Lang = imports.lang;

const Articles = imports.articles;
const Db = imports.db;
const Util = imports.util;

let store_instance = null;

function getDefault() {
    if (store_instance == null)
        store_instance = new Store();

    return store_instance;
}

const Store = new Lang.Class({
    Name: 'Store',
    Extends: Gom.Adapter,
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
      'db': GObject.ParamSpec.object('db', 'Database',
            'The interface with the underlying database.',
            GObject.ParamFlags.READABLE,
            Db.Db),
      'pocketApi': GObject.ParamSpec.object('pocketApi', 'Pocket API',
            'Pocket API endpoint.',
            GObject.ParamFlags.READABLE,
            Db.Db),
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

    set pocketApi(pocketApi) {
        this._pocketApi = pocketApi;
    },

    _init: function() {
        this.parent();

        this._mylist = new Gio.ListStore(GObject.TYPE_OBJECT);
        this._archive = new Gio.ListStore(GObject.TYPE_OBJECT);
        this._favorites = new Gio.ListStore(GObject.TYPE_OBJECT);

        this._pocketApi = null;

        this._db = Db.getDefault();
        this._db.connect('db-ready', this._loadArticles.bind(this));

        this._settings = Util.getSettings("com.github.felipeborges.bolso",
                                          "/com/github/felipeborges/bolso/");
    },

    _loadArticles: function(repository) {
        let object_type = new Articles.Item();
        let filter = Gom.Filter.new_is_not_null (object_type, "item-id");

        this._db.loadObjects(object_type, filter, this._addArticle.bind(this));
    },

    _addArticle: function(article) {
        if (article.isArchived()) {
            this._archive.insert(0, article);
        } else {
            if (article.isFavorite()) { // FIXME
                this._favorites.insert(0, article)
            }
            this._mylist.insert(0, article);
        }
    },

    retrieveArticles() {
        let since = this._settings.get_string('pocket-last-update');
        this._pocketApi.retrieveAsync("state", "all", null, since, null,
          (function(list, since) {
            if (since) {
                this._settings.set_string('pocket-last-update', since.toString());
            }

            for (let idx in list) {
                let item = new Articles.Item();
                item.populateFromJsonObject(list[idx]);
                this._db.saveObject(item);
                this._addArticle(item);
            }
          }).bind(this));
    },

    close: function() {
        this._db.close_async(Lang.bind(this, function(adapter, result) {
            try {
                this._db.close_finish(result);
            } catch (e) {
                log(e);
            }
        }));
    }
});
