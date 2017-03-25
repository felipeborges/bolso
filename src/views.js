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
const Articles = imports.articles;
const Store = imports.store;
const Util = imports.util;

const FALLBACK_THUMBNAIL = "/bolso/icons/fallback.jpg";
const THUMB_WIDTH = 128;
const THUMB_HEIGHT = 85;

const View = new Lang.Class({
    Name: 'View',
    Extends: Gtk.Stack,
    Template: 'resource:///bolso/resources/views.ui',
    InternalChildren: [
      'listBox',
      'scrolledWindow',
      'spinner',
    ],
    Signals: {
      'item-activated': {
        param_types: [GObject.TYPE_OBJECT],
      },
    },

    _init: function() {
        this.parent();

        this._listBox.connect('row-activated', (function(listbox, row) {
            let w = row.get_child();

            this.emit('item-activated', w.article);
        }).bind(this));

        /* Lazy loading */
        let scrollbar = this._scrolledWindow.get_vscrollbar();
        scrollbar.connect('value-changed', this._lazyLoading.bind(this));
    },

    bind_model: function(model) {
        this._listBox.bind_model(model, this._createWidgetFunction);
        this._listBox.set_header_func(this._updateHeaderFunction)
    },

    _createWidgetFunction: function(item) {
        let widget = new ListViewItem();
        widget.article = item;
        widget.title = item.resolved_title;
        widget.excerpt = item.excerpt.substring(0, 160) + "…";
        widget.updateImage();

        return widget;
    },

    _updateHeaderFunction: function(row, before) {
        if (!before) {
            row.set_header(null);
            return;
        }

        let current = row.get_header();
        if (!current) {
            current = new Gtk.Separator({
                orientation: Gtk.Orientation.HORIZONTAL
            });
            row.set_header(current);
        }
    },

    _lazyLoading: function(scrollbar) {
        let adjustment = scrollbar.get_adjustment();
        let value = adjustment.get_value();
        let upper = adjustment.get_upper();
        let psize = adjustment.get_page_size();

        if (value >= (upper - psize)) {
            this._spinner.visible = !this._spinner.visible;

            let store = Store.getDefault();
            store.loadArticles();
        }
    },
});

const ListViewItem = new Lang.Class({
    Name: 'ListViewItem',
    Extends: Gtk.Stack,
    Properties: {
      'title': GObject.ParamSpec.string('title', 'Title',
          'Main identification string of an article.',
          GObject.ParamFlags.READWRITE,
          "Title not found"),
      'excerpt': GObject.ParamSpec.string('excerpt', 'Excerpt',
          'Short description of an article.',
          GObject.ParamFlags.READWRITE,
          ""),
    },
    Template: 'resource:///bolso/resources/list-view-item.ui',
    InternalChildren: [
      'image',
      'title',
      'excerpt',
    ],

    set title(label) {
         this._title.set_label(label);
    },

    set excerpt(label) {
        this._excerpt.set_label(label);
        this._excerpt.set_line_wrap(true);
    },

    _init: function(article) {
        this.article = article;

        this.parent();
    },

    updateImage: function() {
        if (this.article.cached_thumb) {
            this._setPixbuf(this.article.cached_thumb);
            return;
        }

        if (!this.article.images)
            return;
        let url = this.article.images[1].src;
        Util.downloadImageAsync(url, Lang.bind(this, function(path) {
            this._setPixbuf(path);
            this.article.storeThumb(path);
        }));
    },

    _setPixbuf: function(path) {
        try {
            let final_path = (this.article.has_image == "1") ? path : FALLBACK_THUMBNAIL;

            let pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(final_path, THUMB_WIDTH, THUMB_HEIGHT, false);
            this._image.set_from_pixbuf(pixbuf);
        } catch(e) {
            log(e);
        }
    }
});
