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
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const WebKit = imports.gi.WebKit;

const Application = imports.application;
const Articles = imports.articles;
const Store = imports.store;
const Util = imports.util;
const Views = imports.views;

const STATE = {
    ARTICLE_VIEW: 0,
    COLLECTION_VIEW: 1,
    EMPTY_VIEW: 2,
};

const Window = new Lang.Class({
    Name: 'Window',
    Extends: Gtk.ApplicationWindow,
    Properties: {
      'state': GObject.ParamSpec.int('state', 'State',
            'Which widgets should the app present.',
            GObject.ParamFlags.READWRITE,
            STATE.ARTICLE_VIEW, STATE.EMPTY_VIEW,
            STATE.COLLECTION_VIEW),
    },
    Template: 'resource:///bolso/resources/window.ui',
    InternalChildren: [
      'stack',
      'emptyState',
      'goBackButton',
      'refreshButton',
      'collectionView',
      'articleView',
      'titleBar',
      'stackSwitcher',
      'articleTitle',

      'myListView',
      'archiveView',
      'favoritesView',
      'articleViewSW',
    ],

    set state(s) {
        this._state = s;

        switch (this._state) {
            case STATE.ARTICLE_VIEW:
                this._stack.set_visible_child(this._articleView);
                this._titleBar.set_visible_child(this._articleTitle);
                this._goBackButton.show();
                this._refreshButton.hide();
                this._webview.show();
                break;
            case STATE.COLLECTION_VIEW:
                this._stack.set_visible_child(this._collectionView);
                this._goBackButton.hide();
                this._titleBar.set_visible_child(this._stackSwitcher);
                this._stackSwitcher.set_sensitive(true);
                this._refreshButton.show();
                break;
            case STATE.EMPTY_VIEW:
                this._stack.set_visible_child(this._emptyState);
                this._goBackButton.hide();
                this._titleBar.set_visible_child(this._stackSwitcher);
                this._stackSwitcher.set_sensitive(false);
                break;
        }
    },

    get state() {
        return this._state;
    },

    _init: function(params) {
        this.parent(params);

        this._searchActive = true;

        Util.initActions(this,
                         [{ name: 'about',
                            activate: this._about },
                          { name: 'save-item',
                            activate: this._saveItemDialog }]);

        /* Default state */
        this.state = STATE.COLLECTION_VIEW;

        /* FIXME: connect buttons in the template file instead. */
        this._goBackButton.connect('clicked', this.showCollectionView.bind(this));
        this._refreshButton.connect('clicked', this.refresh.bind(this));

        this._webview = new WebKit.WebView();
        this._articleViewSW.add(this._webview);
    },

    bindModel: function(store) {
        this._myListView.bind_model(store.mylist);
        this._myListView.connect('item-activated', this.viewArticle.bind(this));

        this._favoritesView.bind_model(store.favorites);
        this._favoritesView.connect('item-activated', this.viewArticle.bind(this));

        this._archiveView.bind_model(store.archive);
        this._archiveView.connect('item-activated', this.viewArticle.bind(this));
    },

    viewArticle: function(view, article) {
        this.state = STATE.ARTICLE_VIEW;

        this._articleTitle.set_label(article.resolved_title);
        this._webview.open(article.resolved_url);
    },

    showCollectionView: function() {
        this._webview.open("about:blank");
        this.state = STATE.COLLECTION_VIEW;
    },

    refresh: function() {
        let store = Store.getDefault();
        store.retrieveArticles();
    },

    _about: function() {
        let aboutDialog = new Gtk.AboutDialog(
            { authors: [ 'Felipe Borges <felipeborges@gnome.org>' ],
              translator_credits: _("translator-credits"),
              program_name: _("Bolso"),
              comments: _("A Read it Later app for GNOME"),
              copyright: 'Copyright 2014 The Bolso developers',
              license_type: Gtk.License.GPL_2_0,
              logo_icon_name: pkg.name,
              version: pkg.version,
              website: 'https://github.com/felipeborges/bolso',
              wrap_license: true,
              modal: true,
              transient_for: this
            });

        aboutDialog.show();
        aboutDialog.connect('response', function() {
            aboutDialog.destroy();
        });
    },
});
