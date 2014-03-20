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

    _init: function(collection, title, header_bar) {
        this.collection = collection;
        this.title = title;

        this.widget = new Gtk.ScrolledWindow();

        this.listBox = new Gtk.ListBox();
        this.widget.add(this.listBox);

        Application.articles.connect("item-added",
            Lang.bind(this, this._onItemAdded));

        this.listBox.connect('row-activated',
            Lang.bind(this, this._onItemActivated));

        this.widget.show_all();
    },

    _onItemAdded: function(source, collection, item) {
        // check whether the given item belongs to this collection
        if (collection !== this.collection)
            return;

        let builder = new Gtk.Builder();
        builder.add_from_resource('/gnome-pocket/resources/listbox.ui');

        let row = builder.get_object('item-row');

        let image = builder.get_object('row-image');
        this.updateThumbnail(item, image);

        let label = builder.get_object('row-title');
        label.set_label(item.getTitle());

        let content = builder.get_object('row-excerpt')
        content.set_label(item.getDescription());

        this.listBox.add(row);
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

    _init: function(header_bar) {
        this.header_bar = header_bar;

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

        this.addButtons();
        this.widget.show_all();
    },

    _onActiveChanged: function(articles, collection, item) {
        this.header_bar.set_custom_title(null);
        this.header_bar.set_title(item.given_title);

        this._backButton.show();
        this._popoverButton.show();

        this._webview.open(item.resolved_url);
    },

    addButtons: function() {
        this._backButton = new Gtk.Button({ image: Gtk.Image.new_from_icon_name('go-previous-symbolic', 1) });
        this._backButton.connect('clicked', Lang.bind(this, this._onBackButtonClicked));

        this.header_bar.pack_start(this._backButton);

        // popover
        let popover = new Gtk.Popover();

        this._archiveButton = this.addArchiveButton();
        //this._deleteButton = this.addDeleteButton();
        //this._starButton = this.addFavoriteButton();

        let grid = new Gtk.Grid({ margin: 6,
                                  column_spacing: 6 });
        grid.add(this._archiveButton);
        //grid.add(this._deleteButton);
        //grid.add(this._starButton);
        popover.add(grid);

        this._popoverButton = new Gtk.ToggleButton({ image: Gtk.Image.new_from_icon_name('view-list-symbolic', 1) });
        this._popoverButton.connect('clicked', Lang.bind(this, function() {
            popover.show_all();
        }));

        popover.set_relative_to(this._popoverButton);
        this.header_bar.pack_end(this._popoverButton);
    },

    _onBackButtonClicked: function() {
        let activeCollection = Application.articles.getActiveCollection();
        Application.articles.setActiveItem(activeCollection, null);

        this._backButton.hide();
        this._popoverButton.hide();

        // go blank so we don't show last page while loading a new one
        this._webview.open('about:blank');
    },

    addArchiveButton: function(collection, item) {
        let button = new Gtk.Button({ image: Gtk.Image.new_from_icon_name('object-select-symbolic', 1) });
        button.connect('clicked', Lang.bind(this, function() {
            Application.pocketApi.archiveItemAsync(item,
                Lang.bind(this, function(json) {
                    if (json.action_results == "true") {
                        Application.articles.setActiveItem(collection, null);
                    }
                }));

            button.destroy();
        }));
        button.show();
        return button
    },
})
