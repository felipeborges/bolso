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

const GdkPixbuf = imports.gi.GdkPixbuf;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const WebKit = imports.gi.WebKit;

const Application = imports.application;
const Util = imports.util;

const FALLBACK_THUMBNAIL = "/gnome-pocket/icons/fallback.jpg";
const THUMB_WIDTH = 95;
const THUMB_HEIGHT = 80;

const OverView = new Lang.Class({
    Name: 'Overview',

    _init: function(collection, title, toolbar) {
        this._toolbar = toolbar;

        this.collection = collection;
        this.title = title;

        this.widget = new Gtk.ScrolledWindow();

        this.listBox = new Gtk.ListBox();
        this.widget.add(this.listBox);

        Application.articles.connect("item-added",
            Lang.bind(this, this._onItemAdded));

        Application.articles.connect("item-removed",
            Lang.bind(this, this._onItemRemoved));

        this.listBox.connect('row-activated',
            Lang.bind(this, this._onItemActivated));

        this.widget.show_all();
    },

    _onItemAdded: function(source, collection, item) {
        // check whether the given item belongs to this collection
        if (collection !== this.collection)
            return;

        let builder = new Gtk.Builder();
        builder.add_from_resource('/gnome-pocket/resources/views.ui');

        let row = builder.get_object('item-row');

        let image = builder.get_object('row-image');
        this.updateThumbnail(item, image);

        let label = builder.get_object('row-title');
        label.set_label(item.getTitle());

        let content = builder.get_object('row-excerpt')
        content.set_label(item.getDescription());

        this.listBox.add(row);
    },

    _onItemRemoved: function(source, collection, item) {
        if (collection !== this.collection)
            return;

        Application.pocketApi.deleteItemAsync(item, Lang.bind(this, function(json) {
            if (json['action_results'] == "true") {
                let row = this.listBox.get_selected_row();
                this.listBox.remove(row);
            }
        }));
    },

    updateThumbnail: function(item, image) {
        let fallbackPixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(FALLBACK_THUMBNAIL, THUMB_WIDTH, THUMB_HEIGHT, false);

        if (item.has_image != "1") {
            image.set_from_pixbuf(fallbackPixbuf);
            return;
        }

        let url = item.images[1].src
        Util.downloadImageAsync(url, Lang.bind(this, function(path) {
            try {
                let pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(path, THUMB_WIDTH, THUMB_HEIGHT, false);
                image.set_from_pixbuf(pixbuf);
            } catch(e) {
                image.set_from_pixbuf(fallbackPixbuf);
            }
        }));
    },

    _onItemActivated: function(source, row) {
        Application.articles.setActiveItemById(this.collection, row.get_index());
    }
});

const Preview = new Lang.Class({
    Name: 'Preview',

    _init: function(toolbar) {
        this._toolbar = toolbar;

        this.widget = new Gtk.ScrolledWindow();
        
        this._webview = new WebKit.WebView();
        this.widget.add(this._webview);

        Application.articles.connect('active-changed',
            Lang.bind(this, function(articles, collection, item) {
                // if active item is null then propagate the signal
                if (!item) {
                    return false;
                }

                this._onActiveChanged(articles, collection, item);
                return true;
            }));

        this.widget.show_all();
    },

    _onActiveChanged: function(articles, collection, item) {
        // go blank so we don't show last page while loading a new one
        this._webview.open("about:blank");
        this._webview.open(item.resolved_url);

        this._toolbar.set_preview_mode();
    }
})
