/* db.js
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

const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gom = imports.gi.Gom;

const Articles = imports.articles;

const QUERY_SIZE = 20;

let db_instance = null;

function getDefault() {
    if (db_instance == null)
        db_instance = new Db();

    return db_instance;
}

const Db = new Lang.Class({
    Name: 'Db',
    Extends: Gom.Adapter,
    Properties: {
      'repository': GObject.ParamSpec.object('repository', 'Repository',
        'Gom.Repository.',
        GObject.ParamFlags.READABLE,
        Gom.Repository),
    },
    Signals: {
      'db-ready': {
        param_types: [GObject.TYPE_OBJECT],
      },
    },

    get repository() {
        if (!this._repository) {
            this._repository = new Gom.Repository({
                adapter: this,
            });
        }

        return this._repository;
    },

    _init: function() {
        this.parent();

        this._offset = 0;
        this.open_async(this._getDbPath(), this._onOpened.bind(this));
    },

    _getDbPath: function() {
        let cachePath = GLib.build_filenamev([
            GLib.get_user_cache_dir(),
            "/bolso/", /* TODO: dynamically get application name. */
        ]);

        try {
            let dir = Gio.File.new_for_path(cachePath);
            dir.make_directory_with_parents(null);
        } catch (e) { }

        return GLib.build_filenamev([cachePath, "articles.db"]);
    },

    _onOpened: function(adapter, result) {
        try {
            let db_opened = this.open_finish(result);
            if (db_opened) {
                this._repository = new Gom.Repository({
                    adapter: this,
                });
                let object_type = new Articles.Item();
                this._repository.automatic_migrate_async(1, [object_type], this._onMigrated.bind(this));
            }
        } catch (e) {
            log("Db._onOpened: " + e);
        }
    },

    _onMigrated: function(repository, result) {
        try {
            let migrated = repository.automatic_migrate_finish(result);
            if (migrated) {
                this.emit("db-ready", repository);
            }
        } catch(e) {
            log("Db._onMigrated: " + e);
        }
    },

    saveObject: function(object) {
        object.repository = this._repository;
        object.save_sync();
    },

    loadObjects: function(object_type, filter, callback) {
        this._repository.find_async (object_type, filter, this._onLoadCallback.bind(this));

        this._load_objects_callback = callback;
    },

    _onLoadCallback: function(source, result) {
        let group = null;
        try {
            group = this._repository.find_finish (result);
            if (!group)
                return;

            if (this._offset == 0)
                this._offset = group.get_count();

            this._offset = this._offset - QUERY_SIZE;
            group.fetch_async(this._offset, QUERY_SIZE, this._onResultsLoaded.bind(this));
        } catch (e) {
            log ("Db._onLoadCallback " + e);
        }
    },

    _onResultsLoaded: function(group, result) {
        try {
            let loaded = group.fetch_finish(result);
            if (loaded) {
                for (let idx = this._offset; idx < this._offset + QUERY_SIZE; idx++) {
                    this._load_objects_callback(group.get_index(idx));
                }
            }
        } catch (e) {
            log ("_onResultsLoaded: " + e);
        }
    },
});
