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

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const WebKit = imports.gi.WebKit;

const Application = imports.application;

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
        builder.add_from_resource('/gnome-pocket/listbox.ui');

        let row = builder.get_object('item-row');

        let label = builder.get_object('row-title');
        label.set_label(item.given_title);

        let content = builder.get_object('content-source')
        content.set_label(item.resolved_url);

        this.listBox.add(row);
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

        this.widget.show_all();

        Application.articles.connect('active-changed',
            Lang.bind(this, this._onActiveChanged));
    },

    _onActiveChanged: function(articles, collection, item) {
        this.header_bar.set_custom_title(null);
        this.header_bar.set_title(item.given_title);
        this._webview.open(item.resolved_url);
    },
})
