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

pkg.initGettext();
pkg.initFormat();
pkg.require({ 'Gdk': '3.0',
              'Gio': '2.0',
              'GLib': '2.0',
              'GObject': '2.0',
              'Gtk': '3.0' });

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Articles = imports.articles;
const Pocket = imports.pocket;
const Util = imports.util;
const Window = imports.window;

let pocketApi = null;
let articles = [];

const QUERY_SIZE = 20;

function initEnvironment() {
    window.getApp = function() {
        return Gio.Application.get_default();
    };
}

const Application = new Lang.Class({
    Name: 'Application',
    Extends: Gtk.Application,

    _init: function() {
        this.parent({ application_id: 'com.github.felipeborges.Pocket' });

        GLib.set_application_name(_("Pocket"));
    },

    _onQuit: function() {
        this.quit();
    },

    _initAppMenu: function() {
        let builder = new Gtk.Builder();
        builder.add_from_resource('/bolso/resources/app-menu.ui');

        this.set_app_menu(builder.get_object('app-menu'));
    },

    vfunc_startup: function() {
        this.parent();

        Util.loadStyleSheet('/bolso/resources/application.css');

        Util.initActions(this,
                         [{ name: 'quit',
                            activate: this._onQuit }]);
        this._initAppMenu();

        articles = new Articles.Articles();
        Pocket.authenticate(Lang.bind(this, function(consumer_key, access_token) {
            pocketApi = new Pocket.Api();
            let status = pocketApi.set_credentials(consumer_key, access_token);

            if (status !== Pocket.PocketStatusCodes.REQUEST_SUCCESSFUL) {
                this._initGettingStarted();
                return;
            }

            this._retrieveArticles();
        }));

        this._window = new Window.MainWindow({ application: this });
    },

    _retrieveArticles: function() {
        pocketApi.retrieveAsync("state", "unread", QUERY_SIZE, 0,
            Lang.bind(this, this._addListToCollection));

        pocketApi.retrieveAsync("favorite", "1", QUERY_SIZE, 0,
            Lang.bind(this, this._addListToCollection));

        pocketApi.retrieveAsync("state", "archive", QUERY_SIZE, 0,
            Lang.bind(this, this._addListToCollection));
    },

    _addListToCollection: function(list) {
        for (let idx in list) {
            articles.addItem(new Articles.Item(list[idx]));
        }
    },

    _initGettingStarted: function() {
        let dialog = new Gtk.Dialog({ transient_for: this._window,
                                      modal: true,
                                      destroy_with_parent: true,
                                      default_width: 600,
                                      default_height: 100,
                                      title: _("Setup your Pocket account"),
                                      use_header_bar: true });
        let closeButton = dialog.add_button('gtk-close', Gtk.ResponseType.CLOSE);
        dialog.set_default_response(Gtk.ResponseType.CLOSE);

        closeButton.connect('button-press-event', Lang.bind(this, function() {
            dialog.destroy();
            this._onQuit();
        }));

        let contentArea = dialog.get_content_area();
        let label = new Gtk.Label({ label: _("Go to Online Accounts and add a Pocket account.") });
        contentArea.add(label);

        dialog.show_all();
    },

    vfunc_activate: function() {
        if (this._window) {
            this._window.present();
        }
    },

    vfunc_shutdown: function() {
        this.parent();
    }
});

function main(argv) {
    initEnvironment();

    return (new Application()).run(argv);
}
